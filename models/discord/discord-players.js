const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "discord-player"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	user: {
		id: String,
		username: String,
		descriminator: String,
		avatar: String,
	},
	nickname: String,
	roles: [{ type: Schema.Types.ObjectId, ref: "discord-role" }],
	deleted: Boolean,
	joined: Number,
	_dateUpdated: Number,
});

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
