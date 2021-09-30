/*
SHORTCUT MODEL
Shortcuts are found starting from the top right of each desktop.
They are loaded in by the controller dynamically depending on the type of account requesting them.
*/
const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
const Schema = mongoose.Schema;
const modelName = "shortcut";
const mySchema = new Schema(
	{
		name: String, // short name for selection
		icon: {
			type: Schema.Types.ObjectId,
			ref: "icon",
		},
		public: Boolean,
		admin: Boolean,
		winbox: {
			title: String,
			width: String,
			height: String,
			url: String,
		},
	},
	{
		timestamps: false,
	}
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.setup = async (default_icon) => {
	const exists = await model.exists({ name: "Task Scheduler" });
	if (exists) {
		return false;
	}
	new model({
		name: "Task Scheduler",
		icon: default_icon,
		public: false,
		admin: true,
		winbox: {
			title: "Task Scheduler",
			width: "400px",
			height: "520px",
			url: "/bin/tasks/view",
		},
	}).save();
	new model({
		name: "Icon Manager",
		icon: default_icon,
		public: false,
		admin: true,
		winbox: {
			title: "Icon Manager",
			width: "400px",
			height: "520px",
			url: "/bin/icons/view",
		},
	}).save();
	new model({
		name: "Shortcut Manager",
		icon: default_icon,
		public: false,
		admin: true,
		winbox: {
			title: "Shortcut Manager",
			width: "400px",
			height: "520px",
			url: "/bin/shortcuts/view",
		},
	}).save();
	console.log(
		"Administrative shortcuts appear to be missing, this has been patched."
	);
	return true;
};
model.getAll = async () => {
	return funcs.ConvertToObjects(await model.find({}).populate("icon"));
};

model.getAllAdmin = async () => {
	return funcs.ConvertToObjects(
		await model.find({ admin: true }).populate("icon")
	);
};

model.getAllPublic = async () => {
	return funcs.ConvertToObjects(
		await model.find({ admin: false }).populate("icon")
	);
};

model.get = async (_id) => {
	let icon = await model.findById(_id).populate("icon");
	return icon.toObject({ flattenMaps: true });
};
model.add = (shortcut) => {
	const newShortcut = new model(shortcut);
	newShortcut.save();
};
model.delete = (_id) => {
	model.findByIdAndRemove(_id);
};

module.exports = model;
