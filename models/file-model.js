const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
const Schema = mongoose.Schema;
const modelName = "file";
const mySchema = new Schema({
	name: String,
	type: String,
	data: {
		type: Map,
		of: Object,
	},
});
const model = mongoose.model(modelName, mySchema);
///funcs///

const removeDefaultDuplicates = async (items) => {
	//console.log(items);
	for (let item of items) {
		let exists = await model.exists(item);
		if (!exists) {
			console.log(
				"[file-modal] -> Source code has changed for Default files. Clearing old files..."
			);
			let oldModels = await model.deleteMany({
				name: item.name,
				type: item.type,
			});
			await new model(item).save().then((res) => {
				console.log(`Created new default ${res.type}: ${res.name}`);
			});
		}
	}
};

model.setup = async () => {
	let icons = await default_icons();
	await removeDefaultDuplicates(icons);
	let default_icon = await model.findOne({ name: "_file", type: "icon" });
	let shortcuts = await default_shortcuts(default_icon._id);
	await removeDefaultDuplicates(shortcuts);
	const adminFiles = await model.find({
		type: "shortcut",
		"data.requireAdmin": true,
		"data.desktopVisible": false,
	});
	const folder_icon = await model.findOne({ name: "_folder", type: "icon" });
	let adminFolder = await default_folders(folder_icon._id);
	for (let file of adminFiles) {
		adminFolder[0].data.files.push(file._id);
	}

	await removeDefaultDuplicates(adminFolder);
};

/* Folder Data Model:
{
files: [String], <-- ObjectIDs of each file contined within the folder
}
*/

///Setup Icons///
/* Icon Data Model:
{
    iconType:String, <-- Display type, Icon or Image?
    iconTypeData:String, <-- Type Data, can be Icon Class or Image src.
}
*/

const default_shortcuts = async (default_icon = null) => {
	let wrench_icon = await model.findOne({ name: "_wrench", type: "icon" });
	if (!default_icon) {
		console.log(
			"[CRITICAL ERROR]: setupShortcuts was not provided a default_icon!"
		);
		return null;
	}
	return [
		{
			name: "Task Scheduler",
			type: "shortcut",
			data: {
				group: "Admin",
				icon: wrench_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
					title: "Task Scheduler",
					width: "400",
					height: "520",
					url: "/bin/tasks/view",
				},
			},
		},
		{
			name: "Icon Manager",
			type: "shortcut",
			data: {
				group: "Admin",
				icon: wrench_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
					title: "Icon Manager",
					width: "400",
					height: "520",
					url: "/bin/icons/view",
				},
			},
		},
		{
			name: "Shortcut Manager",
			type: "shortcut",
			data: {
				group: "Admin",
				icon: wrench_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
					title: "Shortcut Manager",
					width: "400",
					height: "520",
					url: "/bin/shortcuts/view",
				},
			},
		},
		{
			name: "Folder Manager",
			type: "shortcut",
			data: {
				group: "Admin",
				icon: wrench_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
					title: "Folder Manager",
					width: "400",
					height: "520",
					url: "/bin/folders/view",
				},
			},
		},
		{
			name: "FiveM Server Manager",
			type: "shortcut",
			data: {
				group: "Admin",
				icon: wrench_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
					title: "FiveM Server Manager",
					width: "400",
					height: "520",
					url: "/bin/fiveM/server/view/all/html",
				},
			},
		},
		{
			name: "About",
			type: "shortcut",
			data: {
				group: "default",
				icon: default_icon,
				requireAuth: false,
				requireAdmin: false,
				desktopVisible: true,
				winbox: {
					title: "About Me",
					width: "1024",
					height: "768",
					url: "/about",
				},
			},
		},
	];
};

const default_folders = (default_icon = null) => {
	if (!default_icon) {
		console.log(
			"[CRITICAL ERROR]: setupShortcuts was not provided a default_icon!"
		);
		return null;
	}
	return [
		{
			name: "Admin Tools",
			type: "folder",
			data: {
				group: "Admin",
				icon: default_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: true,
				files: [],
			},
		},
	];
};
const default_icons = () => {
	return [
		{
			name: "_default",
			type: "icon",
			data: {
				group: "default",
				iconType: "icon",
				iconTypeData: "fa fa-user",
			},
		},
		{
			name: "_folder",
			type: "icon",
			data: {
				group: "default",
				iconType: "icon",
				iconTypeData: "fa fa-folder-open",
			},
		},
		{
			name: "_file",
			type: "icon",
			data: {
				group: "default",
				iconType: "icon",
				iconTypeData: "fa fa-file",
			},
		},
		{
			name: "_wrench",
			type: "icon",
			data: {
				group: "default",
				iconType: "icon",
				iconTypeData: "fa fa-wrench",
			},
		},
	];
};
/*
Shortcut Data Model:
{
    icon: ObjectId,
    requireAuth: Boolean, <-- Does this shortcut require the user to be logged in to view?
    requireAdmin: Boolean, <-- Does this shortcut require the user to be a site administrator to view?
    winbox:{
        title:String,
        width:String, <-- \\ 
        height:String, <--\\\\ Strings instead of integers so I can use relative terms like viewer height/width
        url:String, <-- Each winbox is an iframe of another part of the site.
    }
}
*/

model.getFile = async (filter) => {
	let file = await model.findOne(filter);
	if (file) {
		return file.toObject({ flattenMaps: true });
	}
	console.log(`getFile Error: No file found for filter: ${filter}`);
	return null;
};
model.getFiles = async (filter) => {
	let files = await model.find(filter);
	let rtnArray = [];
	files.forEach((file) => {
		rtnArray.push(file.toObject({ flattenMaps: true }));
	});
	return rtnArray;
};
model.removeFile = (_id) => {
	model.findByIdAndRemove(_id);
};
model.getShortcut = async (filter = {}) => {
	Object.assign(filter, { type: "shortcut" });
	let sc = await model.getFile(filter);
	sc.icon = await model.getFile({ _id: sc.data.icon });
	return sc;
};
model.getShortcuts = async (filter = {}) => {
	Object.assign(filter, { type: "shortcut" });
	let scs = await model.getFiles(filter);
	for (let i = 0; i < scs.length; i++) {
		// forEach loops don't like to behave asynchronously.
		scs[i].icon = await model.getFile({ _id: scs[i].data.icon });
	}
	//console.log(scs);
	return scs;
};
model.getFolder = async (filter) => {
	Object.assign(filter, { type: "folder" });
	let fd = await model.getFile(filter);
	fd.icon = await model.getFile({ name: "_folder", type: "icon" });
	return fd;
};
model.getFolders = async (filter) => {
	Object.assign(filter, { type: "folder" });
	let fds = await model.getFiles(filter);
	for (let i = 0; i < fds.length; i++) {
		// forEach loops don't like to behave asynchronously.
		fds[i].icon = await model.getFile({ name: "_folder", type: "icon" });
	}
	return fds;
};
model.addIcon = (data) => {
	new model({
		name: data.name,
		type: "icon",
		data: {
			iconType: data.iconType,
			iconTypeData: data.iconTypeData,
		},
	}).save();
};
model.addShortcut = (data) => {
	new model(data).save();
};
///export///
module.exports = model;
