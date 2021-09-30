let router = require("express").Router();
const lastfmclient = require("lastfm-node-client");
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get(
	"/widget",
	use(async (req, res) => {
		res.render("apps/spotify");
	})
);
router.get("/data", use(async (req,res) => {
    const lastfm = new lastfmclient(process.env.lastfm_api_key);
	let userRecentTracks = await lastfm.userGetRecentTracks({
		user: process.env.lastfm_user,
		limit: 1,
	});
	let recentTrack = userRecentTracks.recenttracks.track[0];
	res.json(recentTrack);
}))
module.exports = router;