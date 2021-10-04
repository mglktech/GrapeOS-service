const mongoose = require("mongoose");
//const logger = require("emberdyn-logger");
const Schema = mongoose.Schema;

const modelName = "fivem-activity";
const mySchema = new Schema(
	{
		server: {
			type: Schema.ObjectId,
			ref: "fivem-server",
			required: true,
		},
		player: {
			type: Schema.ObjectId,
			ref: "fivem-player",
			required: true,
		},
		onlineAt: Number,
		offlineAt: Number,
		online: Boolean,
		sv_id: Number,
	},
	{ timestamps: false }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.create = (params) => {
	// create new dbActivity
	params.onlineAt = Date.now();
	params.online = true;
	return new model(params).save();
};

model.getAllOnline = (server) => {
	return model
		.find({ server, online: true })
		.populate("player")
		.sort({ sv_id: "desc" });
};

model.finish = (_id, offlineAt = Date.now()) => {
	model
		.findByIdAndUpdate(_id, {
			online: false,
			offlineAt,
		})
		.exec();
	// .populate("player")
	// .populate("server")
	// .then((res) => {
	// 	console.log(
	// 		`${res.player.name} has logged out of ${res.server.Data.vars.get(
	// 			"sv_projectName"
	// 		)}`
	// 	);
	// });
};

module.exports = model;
