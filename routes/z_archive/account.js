const router = require("express").Router();
const controller = require("../controllers/account");
const passport = require("passport");
router.get("/login", controller.login_get);
router.get("/create", controller.create_get);
router.get("/home", controller.prot_home_get);
router.get("/logout", controller.logout_get);

router.post(
	"/login",
	passport.authenticate("local", { failureRedirect: "/account/login" }),
	function (req, res) {
		console.log(req.body);
		console.log(`${req.user.username} has logged in.`);
		res.redirect("/account/home");
	}
);
module.exports = router;
