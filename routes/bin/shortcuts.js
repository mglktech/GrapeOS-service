let router = require("express").Router();
const files = require("../../models/file-model");
const isAdmin = require("../../config/auth").isAdmin;
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get(
	"/get/:id",
	isAdmin,
	use(async (req, res) => {
		let file = await files.getShortcut({ _id: req.params.id });
		res.json(file);
	})
);

router.get(
	"/view",
	isAdmin,
	use(async (req, res) => {
		let allShortcuts = await files.getShortcuts({}, false);
		//console.log(allShortcuts);
		res.render("bin/shortcut-manager/shortcut-view", {
			shortcuts: allShortcuts,
		});
	})
);
router.get(
	"/add",
	isAdmin,
	use(async (req, res) => {
		const allicons = await files.getFiles({ type: "icon" });
		res.render("bin/shortcut-manager/shortcut-add", { icons: allicons });
	})
);

router.post(
	"/add",
	isAdmin,
	use((req, res) => {
		let new_file = {
			name: req.body.name, // short name for selection
			type: "shortcut",
			data: {
				icon: req.body.icon,
				desktopVisible: cbtf(req.body.desktopVisible),
				requireAuth: cbtf(req.body.requireAuth),
				requireAdmin: cbtf(req.body.requireAdmin),
				winbox: {
					title: req.body["winbox.title"],
					width: req.body["winbox.width"],
					height: req.body["winbox.height"],
					url: req.body["winbox.url"],
				},
			},
		};
		//console.log(new_file);
		files.addShortcut(new_file);
		res.redirect("/bin/shortcuts/view");
	})
);
router.post(
	"/remove/:id",
	isAdmin,
	use((req, res) => {
		const _id = req.params.id;
		files.findByIdAndRemove(_id).then((r) => {
			res.redirect("/bin/shortcuts/view");
		});
	})
);

function cbtf(val) {
	// Checkbox True/False <-- because checkboxes return "on" if true...
	if (val) {
		return true;
	} else {
		return false;
	}
}

module.exports = router;
