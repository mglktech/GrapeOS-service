const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "os-server"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	fivem_server: { type: Schema.Types.ObjectId, ref: "fivem-server" },
	discord_server: { type: Schema.Types.ObjectId, ref: "discord-server" },
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
