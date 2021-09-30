const mongoose = require("mongoose");
const logger = require("emberdyn-logger");

// [Database Models]
// const serverModel = require("../models/server-model");
// const playerModel = require("../models/player-model");
// const activityModel = require("../models/activity-model");
// const rolesModel = require("../models/role-model");
const cronTaskModel = require("../models/crontask-model");

// const discord = require("./api/discord");

const conn = process.env.DB_STRING;

const connection = mongoose
	.connect(conn, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then(() => {
		logger.database(`[MONGOOSE]: Database Connected.`);
		mongoose.set("useFindAndModify", false);
	})
	.catch((err) => {
		logger.database(`Database Error: ${err}`);
	});

connection.getCrons = async () => {
	return await cronTaskModel.getAll();
};

connection.getCron = async (_id) => {
	return await cronTaskModel.getById(_id);
};

connection.toggleCron = async (_id) => {
	let dataId = await cronTaskModel.toggle(_id);
	connection.offlineEveryone(dataId);
};
connection.addCron = async (cron) => {
	cronTaskModel.add(cron);
};

connection.delCron = (_id) => {
	cronTaskModel.findByIdAndRemove(_id).then((res) => {
		console.log("CRON Removed: " + _id);
	});
};

// connection.getOnline = async (dc_vUrlCode) => {
// 	// Find server by Discord Vanity Url Code
// 	const server = await serverModel
// 		.find({ "discord.vanityUrlCode": dc_vUrlCode })
// 		.exec();
// 	//console.log(server);
// 	const data = await activityModel
// 		.find({ server, currentlyOnline: true })
// 		.populate({
// 			path: "player",
// 			populate: {
// 				path: "discord.roles",
// 				options: {
// 					sort: { rawPosition: "desc" },
// 				},
// 			},
// 		})
// 		.sort({ sv_id: "desc" })
// 		.exec();
// 	return data;
// };

// connection.findPlayer = async (playerInfo) => {
// 	// find player that matches one of the identifiers
// 	const steamID = Object.fromEntries(playerInfo.identifiers).steam;
// 	//console.log(discordID);
// 	let model = await playerModel
// 		.findOne({
// 			"fiveM.identifiers.steam": steamID,
// 		})
// 		.exec();
// 	if (!model) {
// 		model = await connection.savePlayer(playerInfo);
// 	}

// 	if (
// 		!compareObjects(
// 			Object.fromEntries(playerInfo.identifiers),
// 			Object.fromEntries(model.fiveM.identifiers)
// 		) // If the player identifiers have been modified
// 	) {
// 		playerModel // Update the fiveM.identifiers for this player to keep them in sync
// 			.findByIdAndUpdate(model._id, {
// 				"fiveM.identifiers": playerInfo.identifiers,
// 			})
// 			.then((response) => {
// 				//console.log(Object.fromEntries(playerInfo.identifiers));
// 				//console.log(Object.fromEntries(response.fiveM.identifiers));
// 				logger.database(
// 					`${response.fiveM.name} (${response._id}) has had their licenses updated.`
// 				);
// 			});
// 	}
// 	return model;
// };

// connection.updatePlayerDiscord = async (player_id, discord_data) => {
// 	return await playerModel
// 		.findByIdAndUpdate(player_id, { discord: discord_data })
// 		.then((response) => {
// 			logger.database(
// 				`${response.fiveM.name} (${response._id}) has had their Discord information updated`
// 			);
// 			return response;
// 		});
// };
// connection.discoverRoles = async (server, roles) => {
// 	//console.log(`Processing ${roles.length} roles...`);
// 	for await (let role of roles) {
// 		const roleData = await rolesModel.findOne({ server, role_id: role }).exec();
// 		//console.log(roleData);
// 		if (!roleData) {
// 			const newRole = new rolesModel({
// 				server,
// 				role_id: role,
// 			});
// 			newRole.save();
// 			//console.log("new role discovered?");
// 		}
// 	}
// };

// connection.getRoleByDiscordId = (server, discord_id) => {
// 	return rolesModel.findOne({ server, role_id: discord_id });
// };

// connection.updateRole = (id, roleData) => {
// 	return rolesModel.findByIdAndUpdate(id, roleData).then((role) => {
// 		return role;
// 	});
// };

// connection.getEmptyRoles = (server_id) => {
// 	return rolesModel.find({ server: server_id, name: undefined }).exec();
// };

// connection.getAllPlayers = async (server_id) => {
// 	const timing = Date.now() - 21600000;
// 	return playerModel.find({ "fiveM.server": server_id }).exec();
// };

// connection.savePlayer = (data_fiveM, data_discord = null) => {
// 	const model = new playerModel({
// 		fiveM: data_fiveM,
// 	});
// 	if (data_discord) {
// 		model = playerModel({
// 			fiveM: data_fiveM,
// 			discord: data_discord,
// 		});
// 	}
// 	return model
// 		.save()
// 		.then((data) => {
// 			logger.database(
// 				`Player ${data.fiveM.name} (${data._id}) has been discovered!`
// 			);
// 			return data;
// 		})
// 		.catch((err) => HandleErrors("savePlayer", err));
// };

// connection.getServer = (id) => {
// 	return serverModel.getById(id);
// };
// connection.getServerByVUrl = (vUrl) => {
// 	let sv_data = serverModel
// 		.findOne({ "discord.vanityUrlCode": vUrl })
// 		.exec()
// 		.catch((err) => HandleErrors("getServer(Database)", err));
// 	return sv_data;
// };

// connection.findServer = async (ip, discordID = null) => {
// 	let dbResponse = await serverModel
// 		.findOne({ "fiveM.ips": { $in: [ip] } })
// 		.exec()
// 		.catch((err) => HandleErrors("db_findServerByIp - fivem.ip", err));
// 	if (!dbResponse && discordID) {
// 		// If dbResponse is null & a Discord ID was provided
// 		dbResponse = await serverModel
// 			.findOne({ "discord.id": discordID }) // find by discord ID instead
// 			.then(async (resp) => {
// 				resp.fiveM.ips.push(ip);
// 				await resp.save();
// 				logger.database(
// 					`New IP address added for ${resp.discord.name} (${resp._id}). ip: ${ip}`
// 				);
// 				return resp;
// 			})
// 			.catch((err) => HandleErrors("db_findServerByIp - discord.id", err));
// 	}
// 	return dbResponse;
// };
// connection.saveServer = (data_fiveM, data_discord) => {
// 	return new serverModel({
// 		fiveM: data_fiveM,
// 		discord: data_discord,
// 	})
// 		.save()
// 		.then((data) => {
// 			logger.database(
// 				`Server ${data.discord.name} has been added! (${data._id})`
// 			);
// 			return data;
// 		})
// 		.catch((err) => HandleErrors("saveServer", err));
// };

// connection.syncServer = async (serverId, serverInfo) => {
// 	serverModel
// 		.findByIdAndUpdate(serverId, serverInfo)
// 		.then((data) => {
// 			logger.database(`${data.fiveM.ips[0]} has been synced.`);
// 		})
// 		.catch((err) => HandleErrors("db_syncServer", err));
// };

// connection.offlineEveryone = async (server) => {
// 	const records = await activityModel
// 		.find({ server, currentlyOnline: true })
// 		.exec();
// 	//console.log(`updating ${records.length} activity records for ${server}`);
// 	records.forEach((record) => {
// 		connection.FinishActivity(record._id);
// 	});
// };

// connection.getPlayer = (id) => {
// 	return playerModel.findById(id);
// };

connection.updateActivities = async (players, server) => {
	for await (const player of players) {
		const exists = await db_online.some((record) => {
			//console.log(`> ${record.player} ::: ${id} <`);
			return record.player.toString() === player._id.toString();
		});

		if (!exists) {
		}
	}
};

// connection.getActivities = async (query) => {
// 	return await activityModel.find(query).exec();
// };

// connection.CreateActivity = async (server, player) => {
// 	const onlineAt = Date.now();
// 	const newActivityModel = await new activityModel({
// 		server,
// 		player: player.playerModel,
// 		onlineAt,
// 		currentlyOnline: true,
// 		sv_id: player.sv_id,
// 	}).save();
// 	// logger.event(
// 	// 	`${newActivityModel.player.fiveM.name} (${player._id}) has come online`
// 	// );
// 	logger.event(
// 		`${newActivityModel.player.fiveM.name} (${newActivityModel.player._id}) has come online`
// 	);
// 	return newActivityModel;
// };

// connection.FinishActivity = (id) => {
// 	const now = Date.now();
// 	activityModel
// 		.findByIdAndUpdate(id, {
// 			currentlyOnline: false,
// 			offlineAt: now,
// 		})
// 		.populate("player") // must populate otherwise it cannot grab player name/id
// 		.then((activity) => {
// 			logger.event(
// 				`${activity.player.fiveM.name} (${activity.player._id}) has gone offline`
// 			);
// 		})
// 		.catch((err) => {
// 			HandleErrors("FinishActivity", err);
// 		});
// };

// const UpdateActivityModel = async (server, sv_online) => {
// 	const now = Date.now();
// 	const db_online = await activityModel
// 		.find({ server, currentlyOnline: true })
// 		.exec();
// 	//console.log(db_online);
// 	db_online.forEach(async (record) => {
// 		const exists = await sv_online.some((sv_record) => {
// 			// console.log(
// 			// 	`sv_record._id=${sv_record._id} :: record.player= ${record.player}`
// 			// );
// 			return sv_record._id.toString() === record.player.toString();
// 		});
// 		//console.log(exists);
// 		if (!exists) {
// 			const player = await playerModel.findById(record.player).exec();
// 			logger.event(`${player.fiveM.name} (${player._id}) has gone offline`);
// 			const mod = await activityModel.findOne({ _id: record._id }).exec();
// 			const duration = now - mod.onlineAt;
// 			const model = await activityModel
// 				.findOneAndUpdate(
// 					{ _id: record._id },
// 					{
// 						offlineAt: now,
// 						duration,
// 						currentlyOnline: false,
// 					}
// 				)
// 				.exec();
// 		}
// 	});
// };

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

const HandleErrors = (src = "config/db.js", err) => {
	logger.warn(`[${src}]: ${err}`);
	return null;
};

// Expose the connection
module.exports = connection;
