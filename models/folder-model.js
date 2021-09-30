const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");

const Schema = mongoose.Schema;
const modelName = "folder";

const mySchema = new Schema({
	name: String,
	contents: [
		{
			type: Schema.Types.ObjectId,
			ref: "file",
		},
	],
});
const model = mongoose.model(modelName, mySchema);

model.setup = async (files) => {
	const exists = await model.exists({ name: "Administrative Tools" });
	if (exists) {
		return;
	}
	let contents = [];
	files.forEach((file) => {
		contents.push(file._id);
	});
	new model({
		name: "Administrative Tools",
		contents,
	})
		.save()
		.then((result) => {
			console.log(`New default folder created: ${result.name}`);
		});
};
///export///
module.exports = model;
