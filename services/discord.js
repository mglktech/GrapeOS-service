const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({
	_tokenType: "",
	intents: "GUILD_MESSAGES",
});
const token = process.env.discord_token;
client.login(token);
client.fetchGuild = (guildID) => {
	return client.guilds
		.fetch(guildID)
		.then((guild) => {
			return {
				id: guild.id,
				name: guild.name,
				icon: guild.icon,
				splash: guild.splash,
				discoverySplash: guild.discoverySplash,
				region: guild.region,
				memberCount: guild.memberCount,
				large: guild.large,
				deleted: guild.deleted,
				features: guild.features,
				vanityUrlCode: guild.vanityURLCode,
				description: guild.description,
				banner: guild.banner,
				ownerid: guild.ownerID,
			};
		})
		.catch((err) => HandleErrors(err));
};

client.fetchMember = async (guildID, playerID) => {
	const guild = await client.guilds.fetch(guildID);
	const now = Date.now();
	return await guild.members
		.fetch(playerID)
		.then((member) => {
			return {
				user: {
					id: member.user.id,
					username: member.user.username,
					discriminator: member.user.discriminator,
					avatar: member.user.avatar,
				},
				nickname: member.nickname,
				roles: member._roles,
				deleted: member.deleted,
				joined: member.joinedTimestamp,
				_dateUpdated: now,
			};
		})
		.catch((err) => {
			if (err != "DiscordAPIError: Unknown Member") {
				HandleErrors(err);
			}
		});
};

client.fetchRole = async (guildID, role_id) => {
	const guild = await client.guilds.fetch(guildID);
	//console.log(guild);
	//console.log(`Finding role with id: ${role_id}`);
	return await guild.roles
		.fetch(role_id, false, true)
		.then((role) => {
			return {
				//id: role.id,
				name: role.name,
				color: role.color,
				hoist: role.hoist,
				rawPosition: role.rawPosition,
				managed: role.managed,
				mentionable: role.mentionable,
				deleted: role.deleted,
			};
		})
		.catch((err) => HandleErrors(err));
};

client.fetchRoles = async (guild_id) => {
	const guild = await client.guilds.fetch(guild_id);
	return guild.roles.fetch("", false, true).then((roleManager) => {
		let c = 10;
		let roles = [];
		roleManager.cache.forEach((role) => {
			if (c > 0) {
				c--;
				roles.push(role);
			}
		});
		return roles;
		//console.log("Roles:");
		//console.log(roles);
	});
};

const HandleErrors = (err, src = "services/discord.js") => {
	console.log(`[${src}]: ${err}`);
};

client.on("ready", () => {
	console.log(`Local Discord Client Ready: ${client.user.username}`);
});

module.exports = client;
