let router = require("express").Router();
const files = require("../../models/file-model");
const isAdmin = require("../../config/auth").isAdmin;
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get(
	"/view",
	isAdmin,
	use(async (req, res) => {
		let iconGroups = await files.aggregate([{$match:{type:"icon"}},{
			$group: {_id:"$data.group"},
			
		}]);
		let groupedIconData = [];
		for(let iconGroup of iconGroups) {
			let iconData = await files.getFiles({type:"icon", "data.group":iconGroup._id});
			groupedIconData.push({name:iconGroup._id, iconData});
		}
		//console.log(groupedIconData);
		res.render("bin/icon-manager/icons-view", { iconGroups:groupedIconData });
	})
);
router.get(
	"/view/:id",
	isAdmin,
	use(async (req, res) => {
		let iconData = await files.getFile({_id:req.params.id});
		res.render("bin/icon-manager/icon-properties");
	})
);
router.get(
	"/add",
	isAdmin,
	use((req, res) => {
		res.render("bin/icon-manager/icons-add");
	})
);

router.post(
	"/add",
	isAdmin,
	use((req, res) => {
		const new_icon = {
			name: req.body.iconName,
			iconType: req.body.iconType,
			iconTypeData: req.body.iconTypeData,
		};
		files.addIcon(new_icon);
		res.redirect("/bin/icons/view");
	})
);
module.exports = router;