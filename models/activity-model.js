const mongoose = require("mongoose");
const logger = require("emberdyn-logger");
const Schema = mongoose.Schema;

const modelName = "Activity";
const mySchema = new Schema(
	{
		server: {
			type: Schema.ObjectId,
			ref: "Server",
		},
		player: {
			type: Schema.ObjectId,
			ref: "Player",
		},
		onlineAt: Number,
		offlineAt: Number,
		currentlyOnline: Boolean,
		sv_id: Number,
	},
	{ timestamps: false }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.finish = (_id) => {
	const now = Date.now();
	model
		.findByIdAndUpdate(_id, {
			currentlyOnline: false,
			offlineAt: now,
		})
		.populate("player") // must populate otherwise it cannot grab player name/id
		.then((activity) => {
			logger.event(
				`${activity.player.fiveM.name} (${activity.player._id}) has gone offline`
			);
		});
};
model.finishAll = async (server) => {
	const records = await model.find({ server, currentlyOnline: true });
	logger.event("Sending " + records.length + " players offline...");
	for (let r of records) {
		model.finish(r._id);
	}
};

module.exports = model;
