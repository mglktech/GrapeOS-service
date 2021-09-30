let router = require("express").Router();
const files = require("../../models/file-model");
const isAdmin = require("../../config/auth").isAdmin;
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get(
	"/get/:id", isAdmin, use(async(req,res) => {
		let file = await files.getFile({_id:req.params.id});
		res.json(file);
	})
);
router.post("/remove/:id", isAdmin, use((req,res)=>{
	const _id = req.params.id;
	files.findByIdAndRemove(_id).then((r) => {
		res.redirect("/bin/folders/view");
	});
	

}));
module.exports = router;