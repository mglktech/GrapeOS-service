const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "fivem-player"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	//id: Number,
	identifiers: { type: Map, of: String },
	name: String,
	servers: [{ type: Schema.Types.ObjectId, ref: "fivem-server" }],
	// online: {
	// 	type: Boolean,
	// 	default: true,
	// },
});
// create model based on schema
const model = mongoose.model(modelName, mySchema);

// assign model constants

// model.findPlayer = async (playerInfo) => {
// 	return model.findOneAndUpdate({ name: playerInfo.name }, playerInfo, {
// 		new: true,
// 		upsert: true,
// 	});
// };

module.exports = model;
