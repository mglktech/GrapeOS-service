let router = require("express").Router();
const db = require("../../config/db");
const api = require("../../controllers/api");
const FiveMServerModel = require("../../models/fivem/fivem-server");
const FiveMPlayerModel = require("../../models/fivem/fivem-player");
const FiveMActivityModel = require("../../models/fivem/fivem-activity");
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get(
	"/:cfxCode",
	use(async (req, res) => {
		let svInfo = await FiveMServerModel.fetchByCfx(req.params.cfxCode);
		if (!svInfo) {
			doError(req, res, 404, "Server Not Found");
			return;
		}
		//let activity = await FiveMActivityModel.getAllOnline(svInfo._id);
		res.render("apps/server-status/server-status", { svInfo });
	})
);
router.get(
	"/:cfxCode/activity",
	use(async (req, res) => {
		let svInfo = await FiveMServerModel.fetchByCfx(req.params.cfxCode);
		let activity = await FiveMActivityModel.getAllOnline(svInfo._id);
		res.json(activity);
		//let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
		// deliver as Information window
	})
);

router.get(
	"/:cfxCode/info",
	use(async (req, res) => {
		//let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
		// deliver as Information window
		doError(req, res, 404, "We're still working on this page!");
		return;
	})
);

router.get(
	"/:cfxCode/search",
	use(async (req, res) => {
		//let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
		// deliver as searchable content window
		doError(req, res, 404, "We're still working on this page!");
		return;
	})
);

router.get(
	"/players/:id/info",
	use(async (req, res) => {
		let collectedData = await api.getPlayerInfo(req.params.id);
		if (!collectedData) {
			doError(req, res, 404, "Player Not Found");
			return;
		}
		let data = {
			referer: req.headers.referer,
			playerData: collectedData.plyD,
			activityData: collectedData.recs,
			svData: collectedData.svData,
		};
		res.render("apps/server-status/player-info", data);
	})
);

const doError = (req, res, code = 404, message) => {
	res.render("pages/error", {
		referer: req.headers.referer,
		code,
		message,
	});
};

module.exports = router;
