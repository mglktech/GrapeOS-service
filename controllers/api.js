const timingFuncs = require("../bin/funcs/timing-funcs"); // Custom Timestamp To String Methods
const fiveM = require("../config/api/fivem");
const discord = require("../config/api/discord");
const database = require("../config/db");
const logger = require("emberdyn-logger");
const lastfmclient = require("lastfm-node-client");

const serverModel = require("../models/server-model");
const activityModel = require("../models/activity-model");
const playerModel = require("../models/player-model");
const roleModel = require("../models/role-model");

const FiveMServerModel = require("../models/fivem/fivem-server");
const FiveMPlayerModel = require("../models/fivem/fivem-player");
const FiveMActivityModel = require("../models/fivem/fivem-activity");

const Moment = require("moment");
require("dotenv").config();
/* 
Provisions:
- Server IP Address
- Discord Server ID
*/

/*
MGLK API
Used for getting info from places and responding as JSON 
*/

// const getPlayerInfo = async (id) => {
// 	let plyD = await playerModel.findById(id);
// 	//console.log(JSON.stringify(plyD));
// 	//let activityData = await activityModel.find({ player: plyD }).exec();
// 	let actD = await activityModel
// 		.find({ player: plyD })
// 		.populate("server")
// 		.sort({ onlineAt: "desc" })
// 		.exec();
// 	let svData = {
// 		hrsInFortnite: 0,
// 		hrsOnRecord: 0,
// 	};
// 	let rec = {
// 		shifts: [],
// 	};
// 	let recs = [];
// 	for (let act of actD) {
// 		let [onlineAt, offlineAt] = [
// 			new Moment(act.onlineAt),
// 			new Moment(act.offlineAt),
// 		];
// 		let diff = offlineAt - onlineAt;
// 		let two_weeks_ago = Date.now() - 1209600000;
// 		if (act.onlineAt > two_weeks_ago) {
// 			svData.hrsInFortnite += Math.floor(diff / 1000 / 60 / 60);
// 		}
// 		svData.hrsOnRecord += Math.floor(diff / 1000 / 60 / 60);
// 		svData.id = act.server.discord.id;
// 		svData.icon = act.server.discord.icon; // ??? Gonna be a bug here with same player on multiple servers!
// 		svData.name = act.server.discord.name;
// 		let this_date = onlineAt.format("DD-MM-YYYY");
// 		let shift = {
// 			currentlyOnline: act.currentlyOnline,
// 			id: act.sv_id,
// 			onlineAt: onlineAt.format("HH:mm"),
// 			offlineAt: offlineAt.format("HH:mm"),
// 			duration: timingFuncs.parseTime(diff),
// 		};
// 		if (recs.length > 0) {
// 			if (this_date == recs[recs.length - 1].date) {
// 				rec.shifts.push(shift);
// 				continue;
// 			}
// 		}
// 		rec = {
// 			date: this_date,
// 			shifts: [shift],
// 		};
// 		recs.push(rec);
// 	}
// 	//console.log(JSON.stringify(recs));
// 	return { plyD, recs, svData };
// };
const getPlayerInfo = async (id) => {
	let plyD = await FiveMPlayerModel.findById(id);
	if (!plyD) {
		return;
	}
	//console.log(JSON.stringify(plyD));
	//let activityData = await activityModel.find({ player: plyD }).exec();
	let actD = await FiveMActivityModel.find({ player: plyD })
		.populate("server")
		.sort({ onlineAt: "desc" })
		.exec();
	let svData = {
		hrsInFortnite: 0,
		hrsOnRecord: 0,
	};
	let rec = {
		shifts: [],
	};
	let recs = [];
	for (let act of actD) {
		let [onlineAt, offlineAt] = [
			new Moment(act.onlineAt),
			new Moment(act.offlineAt),
		];
		let diff = offlineAt - onlineAt;
		let two_weeks_ago = Date.now() - 1209600000;
		if (act.onlineAt > two_weeks_ago) {
			svData.hrsInFortnite += Math.floor(diff / 1000 / 60 / 60);
		}
		svData.hrsOnRecord += Math.floor(diff / 1000 / 60 / 60);
		svData.id = act.server.EndPoint; //act.server.discord.id;
		svData.icon = act.server.Data.iconVersion; //act.server.discord.icon; // ??? Gonna be a bug here with same player on multiple servers!
		svData.name = act.server.Data.vars.get("sv_projectName"); //act.server.discord.name;
		let this_date = onlineAt.format("DD-MM-YYYY");
		let shift = {
			online: act.online,
			id: act.sv_id,
			onlineAt: onlineAt.format("HH:mm"),
			offlineAt: offlineAt.format("HH:mm"),
			duration: timingFuncs.parseTime(diff),
		};
		if (recs.length > 0) {
			if (this_date == recs[recs.length - 1].date) {
				rec.shifts.push(shift);
				continue;
			}
		}
		rec = {
			date: this_date,
			shifts: [shift],
		};
		recs.push(rec);
	}
	//console.log(JSON.stringify(recs));
	return { plyD, recs, svData };
};
//getPlayerInfo("6104826fb516711b406cdf16");
const getUserTracks = async (req, res) => {
	const lastfm = new lastfmclient(process.env.lastfm_api_key);
	let userRecentTracks = await lastfm.userGetRecentTracks({
		user: process.env.lastfm_user,
		limit: 1,
	});
	let recentTrack = userRecentTracks.recenttracks.track[0];
	res.json(recentTrack);
};

const getOnlineServerInfo = async (req, res) => {
	const server = await serverModel.getByVanityUrlCode(req.params.vanityUrlCode);
	let ip = server.fiveM.ips[0];
	if (!server.fiveM.online) {
		// is the server actually online?
		res.json({
			online: false,
		});
		return;
	}
	let maxClients = server.fiveM.vars.get("sv_maxClients") || 0;
	let queue = server.fiveM.vars.get("hl_queuecount") || -1;
	let players = server.fiveM.vars.get("hl_players") || -1;
	let res_data = {
		online: true,
		maxClients,
		queue,
		players,
	};
	res.json(res_data);
};

const getOnlinePlayerInfo = async (req, res) => {
	const server = await serverModel.getByVanityUrlCode(req.params.vanityUrlCode);
	//console.log(server);
	// const t1 = Date.now();
	const activityData = await activityModel
		.find({ server, currentlyOnline: true })
		.populate("player", "discord.nickname fiveM.name")
		.sort({ sv_id: "desc" });
	// const t2 = Date.now();
	// console.log(`activityData took ${t2 - t1}ms to complete`);
	let res_data = [];
	for (let activity of activityData) {
		let time = timingFuncs.parseTime(Date.now() - activity.onlineAt);
		let data_player = {
			sv_id: activity.sv_id,
			id: activity.player._id,
			name: activity.player.discord.nickname || activity.player.fiveM.name,
			time,
		};
		res_data.push(data_player);
	}
	//console.log(res_data);
	res.json(res_data);
};

const db_onlinePlayers_get = async (req, res) => {
	const dc_vUrl = req.params.vanityUrlCode;
	const serverInfo = await database.getOnline(dc_vUrl);
	res.json(serverInfo);
};

const fiveM_getServerPlayerInfo = async (ips) => {
	// Iterates through server.fiveM.ips and returns players from first working IP address;
	for (let ip of ips) {
		// Has to be a low-level for loop in order to break out properly;
		const serverInfo = await getServerInfo(ip);
		if (!serverInfo) {
			return null;
		}
		const playerInfo = await getPlayers(ip);
		if (!playerInfo) {
			return null;
		}
		return { serverInfo, playerInfo };
	}
	return null; // Returns null if no player info can be found at all IPs;
};

const getServerInfo = async (ip) => {
	try {
		const srv = new fiveM.Server(ip);
		let data = await srv.getInfo_prune();
		delete data.icon; // Rough to squeeze data for development
		data.ips = [ip];

		return data;
	} catch (err) {
		logger.warn(`fiveM Api::getServerinfo:: ${err}`);
		return null;
	}
	// let vars = new Map(Object.entries(data.vars));
	// data.vars = vars;
};
const fivem_cron_get_imp = async (serverId) => {
	const FiveMService = require("../services/fiveM");
	const FiveMServer = await FiveMServerModel.getById(serverId);
	if (!FiveMServer) {
		console.log(`Error: No Server found for _id:${serverId}`);
		return;
	}
	const srv = new FiveMService.Server(FiveMServer.ip);
	const serverInfo = await srv.getInfo().catch((err) => {
		console.log(
			`Error: No Server Info recieved for ${FiveMServer.ip} [${err.code}]`
		);
		return;
	});
	if (!serverInfo) {
		return;
	}
	//console.log(serverInfo);
	syncServerInfo(FiveMServer, serverInfo);
	const playerInfo = await srv.getPlayers();
	const players = await syncPlayerInfo(playerInfo);
	//console.log(players);
	for (let player of players) {
		// activity sync
		let dbActivity = await FiveMActivityModel.findOne({
			player: player.playerModel._id,
			online: true,
		});
		if (!dbActivity) {
			FiveMActivityModel.create({
				server: FiveMServer._id,
				player: player.playerModel._id,
				sv_id: player.sv_id,
			});
			console.log(
				`${player.playerModel.name} has logged into ${FiveMServer.ip}`
			);
		} else if (dbActivity.sv_id != player.sv_id) {
			// Server id Mismatch on player, put them offline.(they will come online with new sv_id next cycle)
			FiveMActivityModel.finish(dbActivity._id);
		}
		// Move onto next player
	}
	const dbActivities = await FiveMActivityModel.find({
		server: FiveMServer._id,
		online: true,
	}).populate("player");
	//console.log(dbActivities);
	for (let activity of dbActivities) {
		const found = players.find((player) => player.sv_id === activity.sv_id);
		if (!found) {
			FiveMActivityModel.finish(activity._id);
		}
	}
	// syncServerInfo(server, fiveM_server.serverInfo);

	// //const hl_jobs = hl_getJobs(fiveM_server.serverInfo.vars);
	// await syncActivity(server._id, players);
	// await findDiscords(players, server._id);
	// await syncDiscordRoles(server);
	// return;
};

async function syncServerInfo(FiveMServer, serverInfo) {
	return FiveMServerModel.findByIdAndUpdate(
		FiveMServer._id,
		{ vars: serverInfo.vars },
		{
			new: true,
			upsert: true,
		}
	).exec();
}

async function syncPlayerInfo(playerInfo) {
	let players = [];
	for (let player of playerInfo) {
		const p = createPlayer(player);
		let playerModel = await FiveMPlayerModel.findPlayer(p);
		players.push({ playerModel, sv_id: player.id });
	}
	return players;
}
const createPlayer = (playerInfo) => {
	const identifiers = MapIdentifiers(playerInfo.identifiers);
	return { identifiers, name: playerInfo.name };
};

const MapIdentifiers = (identifiers) => {
	let map = [];
	identifiers.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	return new Map(map);
};

const fivem_cron_get = async (serverId) => {
	const sv = await serverModel.findOne({ _id: serverId });
	if (!sv) {
		console.log(
			`[server-model] Fatal Error: _id provided does not match server in database: ${serverId}`
		);
		return;
	}
	const server = await database.getServer(serverId);
	if (!server) {
		logger.warn("Error: No such server");
		return;
	}
	const fiveM_server = await fiveM_getServerPlayerInfo(server.fiveM.ips);
	if (!fiveM_server) {
		serverModel.setOnline(serverId, false);
		logger.warn("Server Offline");
		return;
	}
	//console.log(fiveM_server.serverInfo);
	syncServerInfo(server, fiveM_server.serverInfo);
	const players = await syncPlayerInfo(server, fiveM_server.playerInfo);
	//const hl_jobs = hl_getJobs(fiveM_server.serverInfo.vars);
	await syncActivity(server._id, players);
	await findDiscords(players, server._id);
	await syncDiscordRoles(server);
	return;
};
const fivem_get = async (req, res) => {
	const serverId = req.params.id;
	const server = await database.getServer(serverId);
	if (!server) {
		res.send("Error: No such server");
		return;
	}

	const fiveM_server = await fiveM_getServerPlayerInfo(server.fiveM.ips);
	if (!fiveM_server.serverInfo) {
		res.send("Server Offline");
		return;
	}
	//console.log(fiveM_server.serverInfo);
	syncServerInfo(server, fiveM_server.serverInfo);
	const players = await syncPlayerInfo(server, fiveM_server.playerInfo);
	//const hl_jobs = hl_getJobs(fiveM_server.serverInfo.vars);
	syncActivity(server._id, players);
	res.send("done");

	// Object.entries(hl_jobs).forEach(([key, value]) => {
	// 	console.log(`${key} : ${value}`);
	// });
	//console.log(players);
	// const players = await findPlayers(server._id, playerInfos); // tack on matching sv_ids from server ping
	findDiscords(players, server._id);
	syncDiscordRoles(server);
	// database.updateActivity(players, serverId);
	//console.log(discords);
};

async function syncActivity(server, players) {
	const activities = await database.getActivities({
		server,
		currentlyOnline: true,
	});
	for await (let player of players) {
		//console.log(player);
		const match = await activities.some((record) => {
			// check to see whether player ID matches with this record
			if (record.player.toString() === player.playerModel._id.toString()) {
				if (record.sv_id !== player.sv_id) {
					database.FinishActivity(record._id);
					logger.info(
						`[warning] sv_id mismatch on ${player.playerModel.fiveM.name} 
${record.sv_id} ::: ${player.sv_id} 
This may be because the client has re-connected to the server.`
					);
				}

				return true;
			}
			return record.player.toString() === player.playerModel._id.toString();
		});
		if (!match) {
			database.CreateActivity(server, player);
			//console.log("Creating activity");
		}
	}
	for await (let activity of activities) {
		const match = await players.some((record) => {
			//console.log(`${record.playerModel._id} ::: ${activity.player._id}`);
			return (
				record.playerModel._id.toString() === activity.player._id.toString()
			);
		});
		if (!match) {
			database.FinishActivity(activity._id);
		}
	}
	//console.log(activity);
}

function hl_getJobs(vars) {
	vars = Object.fromEntries(vars);
	return JSON.parse(vars["hl_onlinejobs"]);
}

const findDiscords = async (players, id_server) => {
	// retrieves Database information on all players where player.discord._dateUpdated < a specified time and updates them synchronously
	const srv = await database.getServer(id_server);
	//const dbPlayers = await database.getAllPlayers(id_server);
	//const dcGuild = await database.guilds.fetch(guildID);
	players.forEach(async (player) => {
		player = player.playerModel;
		const identifiers = Object.fromEntries(player.fiveM.identifiers);
		const _dateUpdated = player.discord._dateUpdated || 0;
		const now = Date.now();
		//console.log(identifiers);
		if (identifiers.discord !== undefined) {
			// console.log(
			// 	`${_dateUpdated} COMPARE ${now - process.env.discordTickRate}`
			// );
			if (_dateUpdated < now - process.env.discordTickRate) {
				let dInfo = await discord.fetchMember(
					srv.discord.id,
					identifiers.discord
				);
				if (dInfo) {
					await database.discoverRoles(id_server, dInfo.roles);
					let newRoles = [];
					for await (let roleId of dInfo.roles) {
						const role = await database.getRoleByDiscordId(id_server, roleId);
						newRoles.push(role._id);
					}
					dInfo.roles = newRoles;
					database.updatePlayerDiscord(player._id, dInfo);
				}
			}

			//console.log(dInfo);
		}
	});
};

const syncDiscordRoles = async (server) => {
	const roles = await database.getEmptyRoles(server);
	//console.log(`Processing ${roles.length} new roles...`);
	for await (role of roles) {
		//console.log(`fetchRole(${server.discord.id}, ${role.role_id})`);
		let discordData = await discord.fetchRole(server.discord.id, role.role_id);
		//console.log(`updateRole(${role._id}, ${discordData})`);
		let updatedRole = await database.updateRole(role._id, discordData);
		console.log(`New Role Discovered: ${discordData.name}`);
	}
};

const getPlayers = (ip) => {
	const srv = new fiveM.Server(ip);
	return srv.getPlayersAll().catch((err) => {
		if (err.code === "ECONNABORTED") {
			logger.error(
				"[FiveM] Error ECONNABORTED, Server software caused connection abort"
			);

			return null;
		}
		if (err.code === "ECONNRESET") {
			logger.error(
				"[FiveM] Error ECONNRESET, Server connection reset by server software"
			);

			return null;
		}
		if (err.code === "ECONNREFUSED") {
			logger.error("[FiveM] Error ECONNREFUSED. Server probably offline.");
			return null;
		}
		if (err.code === "ENOTFOUND") {
			logger.error(
				`[FiveM] Error ENOTFOUND. No server found at ${err.config.url}`
			);
			return null;
		}
		console.log(err);
		return null;
	});
};

const addServer = async (req, res) => {
	const ip = req.params.ip;
	const discordID = req.params.discordID.toString();
	const fiveMResponse = await findServerInfo(ip);
	const discordResponse = await discord.fetchGuild(discordID);
	if (!fiveMResponse) {
		res.json({ err: true, msg: `FiveM ERROR: No response found at ip: ${ip}` });
		return;
	}
	if (!discordResponse) {
		res.json({
			err: true,
			msg: `Discord ERROR: No Discord Guild found with id: ${discordID}`,
		});
		return;
	}
	let dbResponse = await database.findServer(ip, discordID);
	if (!dbResponse && fiveMResponse && discordResponse) {
		dbResponse = await database.saveServer(fiveMResponse, discordResponse);
	}
	res.json({ err: false, id: dbResponse._id });
};

const findServerInfo = async (ip) => {
	try {
		const srv = new fiveM.Server(ip);
		let data = await srv.getInfo_prune(ip);
		data.ips = [ip];
		return data;
	} catch (err) {
		logger.warn(`[controllers/api/db.js/findServerInfo]: ${err}`);
		return null;
	}
	// let vars = new Map(Object.entries(data.vars));
	// data.vars = vars;
};

module.exports = {
	addServer,
	fivem_get,
	db_onlinePlayers_get,
	fivem_cron_get,
	fivem_cron_get_imp,
	getUserTracks,
	getOnlinePlayerInfo,
	getOnlineServerInfo,
	getPlayerInfo,
};
