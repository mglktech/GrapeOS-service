// Gameservers = Associated content for a specific community
// in the case of Highlife Roleplay, information scrubbed from their discord server is associated with their live server IP.
// Model relevant player-related content from the discord server like roles,
// Associate roles with discord accounts
// Be able to check almost-live up to date information on each player on the server and their associated roles.

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Role"; // Singular, not sure if capitals are relevant
// make schema, defines structure
const mySchema = new Schema(
	{
		server: {
			type: Schema.Types.ObjectId,
			ref: "Server",
		},
		role_id: String,
		name: String,
		color: Number,
		hoist: Boolean,
		rawPosition: Number,
		managed: Boolean,
		mentionable: Boolean,
		deleted: Boolean,
	},
	{ timestamps: true }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
