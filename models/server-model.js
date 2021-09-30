// Gameservers = Associated content for a specific community
// in the case of Highlife Roleplay, information scrubbed from their discord server is associated with their live server IP.
// Model relevant player-related content from the discord server like roles,
// Associate roles with discord accounts
// Be able to check almost-live up to date information on each player on the server and their associated roles.

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Server"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	fiveM: {
		ips: [String],
		resources: [String],
		enhancedHostSupport: Boolean,
		icon: String,
		server: String,
		vars: {
			type: Map,
			of: String,
		},
		online: Boolean,
		retries:Number,
	},
	discord: {
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
		roles: [
			{
				id: String,
				name: String,
				color: Number,
				hoist: Boolean,
				rawPosition: Number,
				managed: Boolean,
				mentionable: Boolean,
				deleted: Boolean,
			},
		],
	},
});

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.setOnline = async (_id, online) => {
	const sv = await model.findOne({_id});
	if(!sv) {
		console.log(`[server-model] Fatal Error: _id provided does not match server in database: ${_id}`);
		return;
	}
	model.findByIdAndUpdate(_id, { "fiveM.online": online }).exec();
};

model.getById = async (id) => {
	//console.log("new method");
	return model.findById(id);
};
model.getByVanityUrlCode = (urlCode) => {
	return model.findOne({ "discord.vanityUrlCode": urlCode });
};
model.getOne = (scope) => {};

module.exports = model;

// const myOldSchema = new Schema(
// 	{
// 		ip: String,
// 		online: Boolean,
// 		info: {
// 			enhancedHostSupport: Boolean,
// 			icon: String,
// 			resources: [String],
// 			server: String,
// 			vars: {
// 				type: Map,
// 				of: String,
// 			},
// 			version: Number,
// 		},
// 		players: [
// 			{
// 				current_id: Number,
// 				name: String,
// 				online: Boolean,
// 				ping: Number,
// 				identifiers: [String],
// 				lastCameOnline: Number,
// 				activity: [
// 					{
// 						onlineAt: Number,
// 						offlineAt: Number,
// 						duration: {
// 							type: Number,
// 							default: function () {
// 								return this.offlineAt - this.onlineAt;
// 							},
// 						},
// 						session_id: Number,
// 					},
// 				],
// 			},
// 		],
// 	},
// 	{ timestamps: true }
// );
