const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const User = require("../../models/user-model");
const Discord = require("discord.js");
const client = new Discord.Client({
	_tokenType: "",
	intents: "GUILD_MESSAGES",
});
const token = process.env.discord_token;

const customFields = {
	clientID:process.env.discordClientID,
	clientSecret:process.env.discordClientSecret,
	callbackURL:process.env.discordClientRedirect,
	scope:["identify","guilds"],
};

const isAdmin = async (profile) => {
	await client.login(token);
	const guild = await client.guilds.fetch(process.env.GrapeOSGuildID);
	const member = await guild.members.fetch(profile.id);
	if(member._roles.includes(process.env.GrapeOSSuperUserRoleID)) {
		console.log(`Administrator Access Granted: [${member.user.username}] (${member.user.id})`);
		return true;
	}
	return false;
}

const verifyCallback = async (accessToken,refreshToken,profile, done) => {
	// Check if belongs to my server, and check if has the superuser role
	let profileData = {
		discord:profile,
	}
	profileData.admin = await isAdmin(profile);
	User.findOneAndUpdate({"discord.id":profile.id},profileData, {
		new:true,
		upsert:true,
	})
	.then(user => {
		if(!user) {
			return done(null,false);
		}
		return done(null,user);
	})
	.catch(err => {
		done(err);
	})
};

const strategy = new DiscordStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
	//console.log(user);
	done(null, user._id);
});

passport.deserializeUser((userId, done) => {
	User.findById(userId)
		.then((user) => {
			done(null, user);
		})
		.catch((err) => done(err));
});
