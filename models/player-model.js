const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Player"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	fiveM: {
		identifiers: { type: Map, of: String },
		name: String,
		server: { type: Schema.Types.ObjectId, ref: "Server" },
	},
	discord: {
		user: {
			id: String,
			username: String,
			descriminator: String,
			avatar: String,
		},
		nickname: String,
		roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
		deleted: Boolean,
		joined: Number,
		_dateUpdated: Number,
	},
});

const myOldSchema = new Schema(
	{
		identifiers: {
			type: Map,
			of: String,
		},
		identifiersArray: [String],
		name: String,
		aliases: [String],
	},
	{ timestamps: true }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
