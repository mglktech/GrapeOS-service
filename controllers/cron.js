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
	let serverTelemetry = {
		newPlayers: 0,
		loggedIn: 0,
		loggedOut: 0,
		activity: {},
		activitiesTimeStart: 0,
		activitiesTimeEnd: 0,
	};
	let lastSeen = FiveMServer.Flags.lastSeen;
	if (!FiveMServer) {
		console.log(`Error: No Server found for _id:${FiveMServer._id}`);
		return;
	}

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
	const dbActivities = await FiveMActivityModel.find({
		server: FiveMServer,
		online: true,
	})
		.populate("player")
		.lean();
	serverTelemetry.activitiesTimeStart = Date.now();
	let resp1 = await EnsurePlayers_newActivities(
		FiveMServer._id,
		playerInfo,
		dbActivities
	);
	serverTelemetry.newPlayers = resp1.newPlayers;
	serverTelemetry.loggedIn = resp1.loggedIn;
	serverTelemetry.loggedOut = await DisposeOldActivities(
		FiveMServer,
		playerInfo,
		dbActivities
	);
	serverTelemetry.activitiesTimeEnd = Date.now();
	timers.end = Date.now();
	//console.log(FiveMServer.Flags.debugMode);
	let debugString = "S";
	handleDebugMode(FiveMServer.Flags.debugMode, FiveMServer._id, playerInfo);
	if (FiveMServer.Flags.debugMode) {
		debugString = "VB";
	}

	console.log(
		`[${debugString}][${FiveMServer.EndPoint}][${
			timers.serviceEnd - timers.serviceStart
		}ms][${
			serverTelemetry.activitiesTimeEnd - serverTelemetry.activitiesTimeStart
		}ms][t:${playerInfo.length} new:${serverTelemetry.newPlayers} in:${
			serverTelemetry.loggedIn
		} out:${serverTelemetry.loggedOut}] => ${
			timers.end - timers.init
		}ms [${FiveMServer.Data.vars.get("sv_projectName")}]  `
	);
};

async function EnsurePlayers_newActivities(server, playerInfo, dbActivities) {
	let newPlayers = 0;
	let loggedIn = 0;
	let playerInfoLicences = [];
	for (let player of playerInfo) {
		playerInfoLicences.push(player.identifiers.get("license"));
	}
	let playerModels = await FiveMPlayerModel.find({
		"identifiers.license": playerInfoLicences,
	}).lean();
	for (pInfo of playerInfo) {
		let player = playerModels.find(
			(ply) => ply.identifiers.license === pInfo.identifiers.get("license")
		);
		if (!player) {
			newPlayers++;
			player = await new FiveMPlayerModel({
				identifiers: pInfo.identifiers,
				name: pInfo.name,
				servers: [server],
			}).save();
		}
		EnsureServers(server, player);
		let activityMatch = EnsureActivity(server, pInfo, dbActivities, player._id);
		if (activityMatch == false) {
			loggedIn++;
		}
	}
	return { newPlayers, loggedIn };
}
function EnsureServers(server, player) {
	let exists;
	try {
		exists = player.servers.some((sv) => sv.toString() == server.toString());
	} catch {
		exists = false;
	}
	//console.log(player.name);
	//console.log(exists);
	if (!exists) {
		FiveMPlayerModel.findByIdAndUpdate(player._id, {
			$push: { servers: server },
		}).exec();
		console.log(`${player.name} has been discovered on another server`);
	}
}
function EnsureActivity(server, pInfo, dbActivities, player) {
	let license = pInfo.identifiers.license;
	//console.log(dbActivities);
	//console.log(player._id);
	let activityMatch = dbActivities.find((activity) => {
		// console.log(
		// 	`${activity.player._id} === ${player} : ${
		// 		activity.player._id.toString() == player.toString()
		// 	}`
		// );
		return (
			activity.sv_id === pInfo.id &&
			activity.player._id.toString() == player.toString()
		);
		//return activity.sv_id === pInfo.id && activity.player._id === player;
	});
	//console.log(activityMatch);
	if (!activityMatch) {
		FiveMActivityModel.create({
			server,
			player,
			sv_id: pInfo.id,
		});
		return false;
	}
	return true;
}

async function DisposeOldActivities(server, playerInfo, dbActivities) {
	let loggedOut = 0;
	for (let activity of dbActivities) {
		let match = playerInfo.some((ply) => {
			return (
				ply.identifiers.get("license") == activity.player.identifiers.license &&
				ply.id == activity.sv_id
			);
		});
		//console.log(match);
		if (!match) {
			loggedOut++;
			if (server.Flags.state != "200") {
				await FiveMActivityModel.findByIdAndUpdate(activity._id, {
					online: false,
					offlineAt: server.Flags.lastSeen,
				}).exec();
				//FiveMActivityModel.finish(activity._id, server.Flags.lastSeen);
			} else {
				await FiveMActivityModel.findByIdAndUpdate(activity._id, {
					online: false,
					offlineAt: Date.now(),
				}).exec();
			}
		}
	}
	return loggedOut;
}

async function handleDebugMode(flag, server, sv_playerData) {
	if (flag === true) {
		const verboseModel = require("../models/fivem/fivem-verbose");
		//console.log(`DATA FOR ${server}`);
		//console.log(sv_playerData);
		let playerData = [];
		let timestamp = Date.now();
		for (p of sv_playerData) {
			let playerModel = await FiveMPlayerModel.findOne({
				"identifiers.license": p.identifiers.get("license"),
			});
			playerData.push({ player: playerModel._id, sv_id: p.id });
		}
		new verboseModel({ server, playerData, timestamp }).save();
		//console.log(`Verbose took ${Date.now() - timestamp}ms`);
		//return "VB";
	}
	//return "S";
}

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
