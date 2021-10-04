const FiveMServerModel = require("../models/fivem/fivem-server");
const FiveMPlayerModel = require("../models/fivem/fivem-player");
const FiveMActivityModel = require("../models/fivem/fivem-activity");
const FiveMService = require("../services/fiveM");
const maxRetries = process.env.maxRetries || 3;

const resetReadyFlags = async () => {
	let sv_unreadys = await FiveMServerModel.find({ "Flags.ready": false });
	for (sv of sv_unreadys) {
		FiveMServerModel.findByIdAndUpdate(sv._id, { "Flags.ready": true }).exec();
	}
};

const pingFiveMServers = () => {
	FiveMServerModel.find({ "Flags.tracked": true }).then((servers) => {
		servers.forEach(async (server) => {
			if (typeof server.Flags.ready == "undefined") {
				FiveMServerModel.findByIdAndUpdate(server._id, {
					"Flags.ready": true,
				}).exec();
				return;
			}
			if (server.Flags.ready === false) {
				console.log(`[${server.EndPoint}] - Ping Failed, server not ready.`);
				return;
			}
			await FiveMServerModel.findByIdAndUpdate(server._id, {
				"Flags.ready": false,
			}).exec();
			await pingFiveMServer(server);
			await FiveMServerModel.findByIdAndUpdate(server._id, {
				"Flags.ready": true,
			}).exec();
		});
	});
};

const pingFiveMServer = async (FiveMServer) => {
	let timers = {
		init: Date.now(),
		serviceStart: 0,
		serviceEnd: 0,
		end: 0,
	};

	if (!FiveMServer) {
		console.log(`Error: No Server found for _id:${FiveMServer._id}`);
		return;
	}

	let lastSeen = FiveMServer.Flags.lastSeen;
	const srv = new FiveMService.Server(FiveMServer.EndPoint);
	timers.serviceStart = Date.now();
	let serverState;
	const serverInfo = await srv
		.getCfx()
		.then((sv) => {
			serverState = "200";
			timers.serviceEnd = Date.now();
			return sv;
		})
		.catch((err) => {
			timers.serviceEnd = Date.now();
			if (err.code) {
				serverState = err.code;
				console.log(
					`[${FiveMServer.EndPoint}][${
						timers.serviceEnd - timers.serviceStart
					}ms] [${err.code}] [${FiveMServer.Data.vars.get("sv_projectName")}]`
				);
				return;
			}
			serverState = "404";
			console.log(
				`[${FiveMServer.EndPoint}][${
					timers.serviceEnd - timers.serviceStart
				}ms] [${err}] [${FiveMServer.Data.vars.get("sv_projectName")}]`
			);
		});
	// console.log(
	// 	`[${serverInfo}][${FiveMServer.EndPoint}][${
	// 		timers.serviceEnd - timers.serviceStart
	// 	}ms] [${serverState}] [${FiveMServer.Data.vars.get("sv_projectName")}]`
	// );
	if (!serverInfo) {
		FiveMServerModel.findByIdAndUpdate(FiveMServer._id, {
			"Flags.state": serverState,
		}).exec();
		return; // Don't bother updating playerinfo/activities, we have no data!
	}
	FiveMServerModel.findByIdAndUpdate(FiveMServer._id, {
		"Flags.state": serverState,
		"Flags.lastSeen": timers.serviceEnd,
	}).exec();

	const playerInfo = scrubUp(serverInfo.Data.players, FiveMServer._id);
	let serverTelemetry = {
		newPlayers: 0,
		loggedIn: 0,
		loggedOut: 0,
		activitiesTimeStart: 0,
		activitiesTimeEnd: 0,
	};
	/*
	Sychronizing players and activities requires a couple of for loops.
	One to check online players against online activities,
	One to check online activities against online players.
	New players may come online and require an activity to be produced,
	Old players may go offline and require an activity to be completed.
	*/
	// let playerModels = await FiveMPlayerModel.find({
	// 	server: FiveMServer._id,
	// });

	const dbActivities = await FiveMActivityModel.find({
		server: FiveMServer._id,
		online: true,
	})
		.lean()
		.populate({
			path: "player",
			select: "identifiers",
		});
	//console.log(dbActivities);
	serverTelemetry.activitiesTimeStart = Date.now();
	let aggLicenses = [];
	for (let player of playerInfo) {
		aggLicenses.push(player.identifiers.get("license"));
	}
	let playerModels = await FiveMPlayerModel.find({
		"identifiers.license": aggLicenses,
	}).lean();
	//console.log(playerModels);
	for (let player of playerInfo) {
		let license = player.identifiers.get("license");
		//const p = createPlayer(player);
		// let thisPlayer = await FiveMPlayerModel.findPlayerByLicense(
		// 	player.identifiers.get("license")
		// );
		let playerMatch = playerModels.some((ply) => {
			return ply.identifiers.license == player.identifiers.get("license");
		});
		if (!playerMatch) {
			serverTelemetry.newPlayers++;
			//console.log("New player added.");
			await new FiveMPlayerModel(player).save();
		}
		let activityMatch = dbActivities.some((activity) => {
			return activity.sv_id == player.id;
		});
		if (!activityMatch) {
			let thisPlayer = await FiveMPlayerModel.findOne({
				"identifiers.license": license,
			});
			serverTelemetry.loggedIn++;
			FiveMActivityModel.create({
				server: FiveMServer._id,
				player: thisPlayer._id,
				sv_id: player.id,
			});
		}
	}
	serverTelemetry.activitiesTimeEnd = Date.now();

	for (let activity of dbActivities) {
		let match = playerInfo.some((ply) => {
			return (
				ply.identifiers.get("license") == activity.player.identifiers.license &&
				ply.id == activity.sv_id
			);
		});
		if (!match) {
			serverTelemetry.loggedOut++;
			if (FiveMServer.Flags.state != "200") {
				FiveMActivityModel.finish(activity._id, FiveMServer.Flags.lastSeen);
			} else {
				FiveMActivityModel.finish(activity._id);
			}
		}
	}

	timers.end = Date.now();
	console.log(
		`[${FiveMServer.EndPoint}][${timers.serviceEnd - timers.serviceStart}ms][${
			serverTelemetry.activitiesTimeEnd - serverTelemetry.activitiesTimeStart
		}ms][t:${playerInfo.length} new:${serverTelemetry.newPlayers} in:${
			serverTelemetry.loggedIn
		} out:${serverTelemetry.loggedOut}] => ${
			timers.end - timers.init
		}ms [${FiveMServer.Data.vars.get("sv_projectName")}]  `
	);
};

async function syncActivities(activities, svInfo, playerInfo) {}

function scrubUp(playerData, serverId) {
	let rtn = [];
	for (player of playerData) {
		rtn.push(createPlayer(player, serverId));
	}
	return rtn;
}
const createPlayer = (playerInfo, server) => {
	const identifiers = MapIdentifiers(playerInfo.identifiers);
	return { identifiers, name: playerInfo.name, server, id: playerInfo.id };
};
async function syncServerInfo(FiveMServer, serverInfo) {
	delete serverInfo.Data.players;
	return FiveMServerModel.findByIdAndUpdate(FiveMServer._id, serverInfo, {
		new: true,
		upsert: true,
	}).exec();
}

const MapIdentifiers = (identifiers) => {
	let map = [];
	identifiers.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	return new Map(map);
};

// async function timeIt(cmd, svName, func) {
// 	let a = Date.now();
// 	await func;
// 	let b = Date.now();
// 	console.log(`[CRON timeIt] [${cmd} - ${svName}] took ${b - a}ms to complete`);
// }

module.exports = { pingFiveMServers, resetReadyFlags };
