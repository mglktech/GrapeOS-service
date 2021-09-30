const passport = require("passport");
const service = require("../../services/discord");
let router = require("express").Router();
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get("/", passport.authenticate("discord"));
router.get(
	"/redirect",
	passport.authenticate("discord", {
		failureRedirect: "/",
		successRedirect: "/auth/discord/doLogin",
	})
);
router.get(
	"/doLogin",
	use((req, res) => {
		//console.log(req.user.discord);
		// Update Discord Information for users of guilds associated with this DIscordID;
		res.redirect("/home");
	})
);

module.exports = router;
