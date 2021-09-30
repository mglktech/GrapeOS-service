const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const api = require("../../controllers/api");
router.get("/home", (req, res) => res.render("pages/_home"));
// router.get("/apps/serverStatus/:vUrlCode", async (req, res) => {
// 	let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
// 	res.render("pages/server-status", { sv_info });
// });
// router.get("/apps/serverStatus/:vUrlCode/info", async (req, res) => {
// 	let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
// 	// deliver as Information window
// });
// router.get("/apps/serverStatus/:vUrlCode/search", async (req, res) => {
// 	let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
// 	// deliver as searchable content window
// });

router.get("/apps/players/:id/info", async (req, res) => {
	let collectedData = await api.getPlayerInfo(req.params.id);
	let data = {
		referer: req.headers.referer,
		playerData: collectedData.plyD,
		activityData: collectedData.recs,
		svData: collectedData.svData,
	};
	res.render("pages/player-info", data);
});

router.get("/folders/highlife", (req, res) => {
	res.render("iframes/files");
});

module.exports = router;
