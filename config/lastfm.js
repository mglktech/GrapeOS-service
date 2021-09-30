const lastfmclient = require("lastfm-node-client");
require("dotenv").config();
const lastfm = new lastfmclient(process.env.lastfm_api_key);

module.exports = lastfm.userGetRecentTracks({
	user: process.env.lastfm_user,
	limit: 1,
});
