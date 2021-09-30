const express = require("express");
const router = express.Router();
const shortcuts = require("../models/shortcut-model");
const files = require("../models/file-model");

router.get("/", (req, res) => res.json({ ok: true }));
// router.get("/welcome", (req, res) => {
// 	res.render("pages/welcome");
// });
// router.get("/home", async (req, res) => {
// 	let scs = [];
// 	let fds = [];
// 	let authRoute = "/auth/discord";
// 	if (req.isAuthenticated() && req.user.admin) {
// 		// Collect apps from database belonging to Admin?
// 		// collect apps based on JS object?
// 		scs = await files.getShortcuts({ "data.requireAdmin": true, "data.desktopVisible": true, });
// 		fds = await files.getFolders({ "data.requireAdmin": true, "data.desktopVisible": true, });
// 		authRoute = "/auth/logout"
// 		//console.log(scs);
// 	} else if (req.isAuthenticated()) {
// 		authRoute = "/auth/logout"
// 		scs = await shortcuts.getAllPublic();
// 	} else {
// 		scs = await files.getShortcuts({ "data.requireAuth": false, "data.desktopVisible": true, });
// 		fds = await files.getFolders({ "data.requireAuth": false, "data.desktopVisible": true, });
// 	}

// 	let finalArray = scs.concat(fds);
// 	//console.log(finalArray);
// 	res.render("desktops/new_default", { scs:finalArray, authRoute});
// });

// router.get("/folder/:id", async(req, res) => {
// 	const id = req.params.id;
// 	const folderFile = await files.getFile({_id:id});
// 	let resFiles = [];
// 	for await(let file of folderFile.data.files) {
// 		let FileID = file.toString();
// 		let unpackedFile = await files.getShortcut({_id:FileID});
// 		resFiles.push(unpackedFile);
// 	}
// 	//console.log(resFiles);
// 	res.render("pages/folder", {scs:resFiles});
// })

// router.get("/home/public", async(req,res) => {

// 	let scs = await files.getShortcuts({ "data.requireAuth": false, "data.desktopVisible": true, });
// 	let fds = await files.getFolders({ "data.requireAuth": false, "data.desktopVisible": true, });
// 	let authRoute = "/auth/discord";
// 	let finalArray = scs.concat(fds);

// 	res.render("desktops/new_default", { scs:finalArray, authRoute });
// });

// router.get("/about", (req, res) => {
// 	res.render("pages/about");
// });

module.exports = router;
