/*
ICON MODEL
For storing data related to the icons themselves, like the Type, src (if applicable) etc. 
*/
const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
const Schema = mongoose.Schema;
const modelName = "icon";
const mySchema = new Schema(
	{
		name: String, // short name for selection
		type: String, // type of icon eg: img, icon
		typeData: String,
	},
	{
		timestamps: false,
	}
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.setup = async () => {
	const exists = await model.findOne({ name: "default" }, "_id");
	if (exists) {
		return exists._id;
	}
	console.log("A new default icon has been created.");
	new model({
		name: "default",
		type: "icon",
		typeData: "fa fa-user",
	})
		.save()
		.then((result) => result);
};

model.getAll = async () => {
	return funcs.ConvertToObjects(await model.find().sort({ name: "asc" }));
};
model.getById = async (_id) => {
	let icon = await model.findById(_id);
	return icon.toObject({ flattenMaps: true });
};
model.add = (icon) => {
	const newIcon = new model(icon);
	newIcon.save();
};
model.delete = (_id) => {
	model.findByIdAndRemove(_id);
};
// const shortcut = {
//     text: "Underlying text of shortcut",
//     icon:"objectId of Icon",
//     newWindow: true, // Does this shortcut open in a new window?
//     winbox:{
//         title: "Login",
// 	    // modal: true,
// 	    width: "400px",
// 	    height: "400px",
// 	    x: "center",
//         url: "/api/spotify/widget",
// 	    // top: 50,
// 	    // right: 50,
// 	    // bottom: 50,
// 	    // left: 50,
//     }
// }

module.exports = model;
