const express = require("express");
const router = express.Router();
//const FiveM = require("../controllers/api/fivem.js"); // "../controllers/api/fivem"
const api = require("../controllers/api.js");
const model = require("../models/hl-dragtime-model");

//API ROOT ROUTES
//router.get("/", FiveM.index_get);

const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/addServer/:ip/:discordID", use(api.addServer)); // // MOVE THIS TO PROTECTED ROUTES
//router.get("/pingServer/:id", api.fivem_get);
router.get("/playerInfo/:vanityUrlCode", use(api.db_onlinePlayers_get)); // old!
// FIVEM ROUTES

// Server API Routes
router.get("/servers/:vanityUrlCode/playerInfo", use(api.getOnlinePlayerInfo));
router.get("/servers/:vanityUrlCode/serverInfo", use(api.getOnlineServerInfo));
router.get("/players/:id/info", use(api.getPlayerInfo));

// Bespoke Routes

router.get("/bespoke/highlife/dragtimes/", (req, res) => {
	res.render("apps/bespoke/highlife/hl-dragtimes");
});

router.get(
	"/bespoke/highlife/dragtimes/get",
	use(async (req, res) => {
		let data = await model.get();
		res.json(data);
	})
);
router.get(
	"/bespoke/highlife/dragtimes/sortsearch/:sort/:search",
	use(async (req, res) => {
		console.log(req.params.sort, req.params.search);
		let data = await model.get(req.params.sort, req.params.search);
		res.json(data);
	})
);

// LastFM Data
router.get("/lastfm", use(api.getUserTracks));
// WINBOX ROUTES
// router.get("/winbox/hlServerStatus", (req, res) => {
// 	res.render("pages/hl-status");
// });
// router.get("/filemanager/:route", (req, res) => {
// 	const route = req.params.route;
// 	res.render("pages/file-manager", { route });
// });
// router.get("/winbox/btns", (req, res) => {
// 	res.render("pages/btns");
// });
router.get(
	"/spotify/info",
	use(async (req, res) => {
		var data = "";

		res.json(data);
	})
);

// DISCORD API ROUTES
// router.get("/discord", discord.init);
// router.get("/discord/:guildID/get", discord.guild_get);
// router.get("/discord/:guildID/roles/:roleID", discord.role_get);
// router.get("/discord/:guildId/:playerId", discord.player_get);
module.exports = router;
