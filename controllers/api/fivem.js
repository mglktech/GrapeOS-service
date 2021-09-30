require("dotenv").config();
const FiveM_Module = require("../../config/api/fivem");
const ip = process.env.fivem_ip_hl;
const srv = new FiveM_Module.Server(ip);
const logger = require("emberdyn-logger");

const index_get = (req, res) => {};

/// LOW LEVEL DATABASE ACCESS FUNCTIONS SHOULD BE PLACED IN MODELS

const fivem_get = (req, res) => {};
// const fivem_getPlayerCount = async (req, res) => {
// 	let first = await srv
// 		.getPlayers()
// 		.then((data) => {
// 			return data;
// 		})
// 		.catch((err) => {
// 			if (err.code == "ECONNABORTED");
// 			//res.json(err);
// 		});
// 	let second = await srv.getMaxPlayers().then((data) => {
// 		return data;
// 	});
// 	res.json({ playerCount: first, maxPlayers: second });
// };

const fivem_getPlayersAll = async (req, res) => {
	// first, pull/make new server
	const serverInfo = await updateServerInfo(ip); //
	if (!serverInfo) {
		res.json({ error: "Server Offline" });
		// set everyone offline in database?
		return;
	}
	const playerData = await GetPlayers(srv);
	const srv_currentlyOnline = [];
	const server = await serverModel.findOne({ ip }).exec();
	playerData.forEach(async (player) => {
		const cap = await CapturePlayerInfo(player);
		//console.log(cap);
		srv_currentlyOnline.push(cap);
		//console.log(`${srv_currentlyOnline.length}/${playerData.length}`);
		if (srv_currentlyOnline.length == playerData.length) {
			chkActivity(srv_currentlyOnline, server);
			res.json(srv_currentlyOnline);
			//perform database search fr all with currentlyOnline set to true, compare results.
		}
	});
};

async function getPlayer(id) {
	const player = await playerModel.findById(id).exec();
	return player;
}

const fivem_getOnline = (req, res) => {
	srv
		.getServerStatus()
		.then((data) => res.json(data))
		.catch((err) => {
			if (err.code == "ECONNABORTED");
			res.json(err);
		});
};

async function findServer(ip) {
	return await serverModel.findOne({ ip }).exec();
}
async function createServer(ip, data) {
	let vars = new Map(Object.entries(data.vars));
	const sv = await new serverModel({
		ip,
		info: {
			enhancedHostSupport: data.enhancedHostSupport,
			icon: data.icon,
			resources: data.resources,
			server: data.server,
			vars,
			version: data.version,
		},
	}).save();
	return sv;
}
const getServerInfo = async (srv) => {
	return await srv
		.getInfo()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			if (err.code === "ECONNABORTED") {
				logger.error(
					"[FiveM] Error ECONNABORTED, Server software caused connection abort"
				);
				return null;
				//OfflineEveryone(srv);
			}
			if (err.code === "ECONNRESET") {
				logger.error("[FiveM] Error ECONNRESET, Server connection unsteady!");
				return null;
			}
			if (err.code === "ECONNREFUSED") {
				OfflineEveryone(srv);
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

async function OfflineEveryone(srv) {
	const now = Date.now();
	const server = await findServer(srv.ip);
	const records = await activityModel
		.find({ server, currentlyOnline: true })
		.exec();
	records.forEach(async (record) => {
		const mod = await activityModel.findOne({ _id: record._id }).exec();
		const duration = now - mod.onlineAt;
		activityModel
			.findByIdAndUpdate(record._id, {
				offlineAt: now,
				duration,
				currentlyOnline: false,
			})
			.exec();
		const player = await getPlayer(record.player);
		logger.event(
			`${player.name} (${player._id}) has gone offline due to server not responding`
		);
	});
}

async function updateServerInfo(ip) {
	const data = await getServerInfo(srv); // srv is top-level defined
	if (!data) {
		logger.warn("[FiveM_API] Error: could not retrieve server info");
		return null;
	}
	let server = await findServer(ip);
	if (!server) {
		server = await createServer(ip, data);
	}

	let vars = new Map(Object.entries(data.vars));
	let new_data = {
		info: {
			enhancedHostSupport: data.enhancedHostSupport,
			icon: data.icon,
			resources: data.resources,
			server: data.server,
			vars,
			version: data.version,
		},
	};
	//console.log(new_data);
	serverModel.findByIdAndUpdate(server._id, new_data).exec();
	return data;
}

const GetPlayers = (srv) => {
	return srv
		.getPlayersAll()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			if (err.code === "ECONNABORTED") {
				logger.error(`Error connecting to server at url: ${err.config.url}`);
				return [];
			}
			console.log(err);
			return [];
		});
};
const CapturePlayerInfo = async (player) => {
	// first compare player identifiers to database (singular)
	const identifiers = MapIdentifiers(player.identifiers);
	const database = await playerModel
		.findOne({ "identifiers.steam": Object.fromEntries(identifiers).steam })
		.exec();
	// console.log(database);
	if (database === null) {
		let id = "";
		const model = await new playerModel({
			identifiers,
			identifiersArray: player.identifiers,
			name: player.name,
		})
			.save()
			.then((result) => {
				logger.database(`${result.name} (${result._id}) has been discovered!`);
				return result._id;
			});
		return model._id;
	}
	if (
		!compareObjects(
			Object.fromEntries(identifiers),
			Object.fromEntries(database.identifiers)
		) // If the player identifiers have been modified
	) {
		await playerModel
			.findByIdAndUpdate(database._id, {
				identifiers,
				identifiersArray: player.identifiers,
			})
			.exec();
		logger.database(`${player.name} has had their licenses updated.`);
	}
	return database._id;
};

const MapIdentifiers = (identifiers) => {
	let map = [];

	identifiers.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	l;
	return new Map(map);
};

const compareObjects = (o1, o2) => {
	// https://stackoverflow.com/a/5859028
	for (var p in o1) {
		if (o1.hasOwnProperty(p)) {
			if (o1[p] !== o2[p]) {
				return false;
			}
		}
	}
	for (var p in o2) {
		if (o2.hasOwnProperty(p)) {
			if (o1[p] !== o2[p]) {
				return false;
			}
		}
	}
	return true;
};

// async function CreateActivityModel(server, player) {
// 	const onlineAt = Date.now();
// 	const newActivityModel = await new activityModel({
// 		server,
// 		player,
// 		onlineAt,
// 		currentlyOnline: true,
// 	}).save();
// 	logger.info(
// 		`${newActivityModel.player.name} (${player._id}) has come online`
// 	);
// 	return newActivityModel;
// }

async function UpdateActivityModel(server, sv_online) {
	const now = Date.now();
	const db_online = await activityModel
		.find({ server, currentlyOnline: true })
		.exec();
	//console.log(db_online);
	db_online.forEach(async (record) => {
		const exists = sv_online.some((sv_record) => {
			//console.log(`> ${record.player} ::: ${id} <`);
			return sv_record == record.player.toString();
		});
		if (!exists) {
			const player = await getPlayer(record.player);
			logger.info(`${player.name} (${player._id}) has gone offline`);
			const mod = await activityModel.findOne({ _id: record._id }).exec();
			const duration = now - mod.onlineAt;
			const model = await activityModel
				.findOneAndUpdate(
					{ _id: record._id },
					{
						offlineAt: now,
						duration,
						currentlyOnline: false,
					}
				)
				.exec();
		}
	});
}

async function chkActivity(sv_online, server) {
	const curTime = Date.now();
	const db_online = await activityModel
		.find({ server, currentlyOnline: true })
		.exec();
	//console.log(db_online);
	let count = 1;
	// What if server goes offline??? Must set all existing online to offline if that is the case.
	sv_online.forEach(async (id) => {
		const player = await playerModel.findById(id).exec();
		const exists = db_online.some((record) => {
			//console.log(`> ${record.player} ::: ${id} <`);
			return record.player.toString() == id.toString();
		});
		//console.log(exists);
		if (!exists) {
			CreateActivityModel(server, player);
		}
		if (count === sv_online.length) {
			UpdateActivityModel(server, sv_online);
		}
		//console.log(`${count}/${sv_online.length}`);
		count++;
	});
	//UpdateActivityModel(server, sv_online);
}

module.exports = {
	index_get,
	fivem_get,
	fivem_getPlayersAll,
	fivem_getOnline,
};
