const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const modelName = "fivem-verbose";
const mySchema = new Schema(
	{
		server: {
			type: Schema.ObjectId,
			ref: "fivem-server",
			required: true,
		},
		playerData: [
			{
				player: {
					type: Schema.ObjectId,
					ref: "fivem-player",
					required: true,
				},
				sv_id: {
					type: Number,
					required: true,
				},
			},
		],
		timestamp: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: false }
);

// create model based on schema
module.exports = mongoose.model(modelName, mySchema);
