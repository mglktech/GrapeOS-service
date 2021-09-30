const icons = require("../models/icon-model");
const shortcuts = require("../models/shortcut-model");
const users = require("../models/user-model");
const files = require("../models/file-model");
const folders = require("../models/folder-model");
const discord = require("../config/api/discord");

module.exports.setup = async () => {
	await users.setup();
	await files.setup();
	// const client = await discord.login(process.env.discord_token);
	// console.log("Discord Logged In Fetching ROles");
	// const roles = await discord.fetchRoles(process.env.GrapeOSGuildID);
	// console.log(roles);
	//console.log(adminFiles);
	//console.log(await files.getFileById("61449a59e96bf626089695d9"));
	
};
