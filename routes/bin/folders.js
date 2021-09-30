let router = require("express").Router();
const files = require("../../models/file-model");
const fiveMServerModel = require("../../models/fivem/fivem-server");
const isAdmin = require("../../config/auth").isAdmin;
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

router.get(
	"/FiveMServers",
	use(async (req, res) => {
		let allServers = (await fiveMServerModel.fetchAll()) || [];
		res.render("apps/fivem-server-folder", {
			servers: allServers,
		});
	})
);

router.get(
	"/view",
	isAdmin,
	use(async (req, res) => {
		let allFolders = await files.getFolders({});
		//console.log(allFolders);
		res.render("bin/folder-manager/folders-view", {
			folders: allFolders,
		});
	})
);
router.get(
	"/add",
	isAdmin,
	use(async (req, res) => {
		res.render("bin/folder-manager/folders-add", {});
	})
);
router.post(
	"/add",
	isAdmin,
	use(async (req, res) => {
		const filesStringArray = JSON.parse(req.body.files);
		let fileIDS = [];
		for (let string of filesStringArray) {
			const properFile = await files.findOne({ _id: string });
			fileIDS.push(properFile._id);
		}
		let new_folder = {
			name: req.body.name, // short name for selection
			type: "folder",
			data: {
				desktopVisible: toBool(req.body.desktopVisible),
				requireAuth: toBool(req.body.requireAuth),
				requireAdmin: toBool(req.body.requireAdmin),
				files: fileIDS,
			},
		};
		console.log(new_folder);
		files.addShortcut(new_folder);
		res.redirect("/bin/folders/view");
	})
);

function toBool(val) {
	// Checkbox True/False <-- because checkboxes return "on" if true...
	if (val) {
		return true;
	} else {
		return false;
	}
}
module.exports = router;
