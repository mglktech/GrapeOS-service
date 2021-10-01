const FiveMServerModel = require("../models/fivem/fivem-server");
const FiveMPlayerModel = require("../models/fivem/fivem-player");
const FiveMActivityModel = require("../models/fivem/fivem-activity");
const FiveMService = require("../services/fiveM");
const maxRetries = process.env.maxRetries || 3;

const pingFiveMServers = () => {
	FiveMServerModel.find({ "Flags.tracked": true }).then((servers) => {
		servers.forEach((server) => {
			pingFiveMServer(server._id);
		});
	});
};

const pingFiveMServer = async (serverId) => {
	let a = Date.now();
	const FiveMServer = await FiveMServerModel.getById(serverId);
	if (!FiveMServer) {
		console.log(`Error: No Server found for _id:${serverId}`);
		return;
	}
	const srv = new FiveMService.Server(FiveMServer.EndPoint);
	let a1 = Date.now();
	const serverInfo = await srv.getCfx().catch((err) => {
		let b = Date.now();
		if (err.code) {
			console.log(
				`[${FiveMServer.EndPoint}][${b - a1}ms] [${
					err.code
				}] [${FiveMServer.Data.vars.get("sv_projectName")}]`
			);
			return;
		}
		console.log(
			`[${FiveMServer.EndPoint}][${
				b - a1
			}ms] [${err}] [${FiveMServer.Data.vars.get("sv_projectName")}]`
		);
		return;
	});
	if (!serverInfo) {
		return;
	}
	let b1 = Date.now();
	//console.log(serverInfo);
	//syncServerInfo(FiveMServer, serverInfo);
	const playerInfo = scrubUp(serverInfo.Data.players, serverId);
	const dbActivities = await FiveMActivityModel.find({
		server: serverId,
		online: true,
	}).populate("player");
	//console.log(dbActivities);
	//console.log(playerInfo);

	let playerModels = await FiveMPlayerModel.find({
		server: serverId,
		online: true,
	});
	let initPing = b1 - a1;
	let newPlayers = 0;
	let newActivities = 0;
	let oldActivities = 0;
	for (let player of playerInfo) {
		//const p = createPlayer(player);
		let playerMatch = playerModels.some((ply) => {
			return (
				ply.identifiers.get("license") == player.identifiers.get("license")
			);
		});
		let activityMatch = dbActivities.some((activity) => {
			return activity.sv_id == player.id;
		});
		if (!playerMatch) {
			newPlayers++;
			//console.log(`New FiveM Player Discovered: ${player.name}`);
			await new FiveMPlayerModel(player).save();
		}
		if (!activityMatch) {
			newActivities++;
			let thisPlayer = await FiveMPlayerModel.findOne({
				"identifiers.license": player.identifiers.get("license"),
			});
			FiveMActivityModel.create({
				server: serverId,
				player: thisPlayer._id,
				sv_id: player.id,
			});
			FiveMPlayerModel.findByIdAndUpdate(thisPlayer._id, {
				online: true,
			}).exec();
			// console.log(
			// 	`${thisPlayer.name} has logged in to ${FiveMServer.Data.vars.get(
			// 		"sv_projectName"
			// 	)}`
			// );
		}
	}
	for (let activity of dbActivities) {
		let match = playerInfo.some((ply) => {
			return (
				ply.identifiers.get("license") ==
					activity.player.identifiers.get("license") && ply.id == activity.sv_id
			);
		});
		//console.log(match);
		if (!match) {
			oldActivities++;
			//console.log(activity.player._id);
			const now = Date.now();
			FiveMActivityModel.findByIdAndUpdate(activity._id, {
				online: false,
				offlineAt: now,
			}).exec();
			FiveMPlayerModel.findByIdAndUpdate(activity.player._id, {
				online: false,
			}).exec();
		}
	}
	let b = Date.now();
	console.log(
		`[${FiveMServer.EndPoint}][${initPing}ms][t:${
			playerInfo.length
		} new:${newPlayers} in:${newActivities} out:${oldActivities}] => ${
			b - a
		}ms [${FiveMServer.Data.vars.get("sv_projectName")}]  `
	);
};

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

module.exports = { pingFiveMServers };
