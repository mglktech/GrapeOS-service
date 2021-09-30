// Gameservers = Associated content for a specific community
// in the case of Highlife Roleplay, information scrubbed from their discord server is associated with their live server IP.
// Model relevant player-related content from the discord server like roles,
// Associate roles with discord accounts
// Be able to check almost-live up to date information on each player on the server and their associated roles.

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "discord-guild"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	id: String,
	name: String,
	icon: String,
	splash: String,
	discoverySplash: String,
	region: String,
	memberCount: Number,
	large: Boolean,
	deleted: Boolean,
	features: Array,
	vanityUrlCode: String,
	description: String,
	banner: String,
	ownerID: String,
});
model.fetchById = (_id) => {
	//console.log("new method");
	return model.findById(_id);
};
model.fetchByDiscordId = (id) => {
	return model.findOne({ id });
};
model.fetchByVanityUrlCode = (vanityUrlCode) => {
	return model.findOne({ vanityUrlCode });
};

model.create = (item) => {
	return new model(item).save().then((res) => {
		doLog("discord-server", `New Model Created. ${res._id}`);
		return res;
	});
};
model.modify = (id, contents) => {
	model.findByIdAndUpdate(id, contents);
};

function doLog(service, text) {
	let logTxt = `[${service}] -> ${text}`;
	console.log(logTxt);
}
// create model based on schema
const model = mongoose.model(modelName, mySchema);
module.exports = model;
