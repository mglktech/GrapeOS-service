const router = require("express").Router();
const passport = require("passport");
const controller = require("../controllers/auth");
const isAuth = require("../config/auth").isAuth;
const isAdmin = require("../config/auth").isAdmin;
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.use("/discord", require("./auth/discord"));
router.get("/login", use(controller.login_get));
router.get(
	"/create",
	use(function () {})
);
router.get(
	"/home",
	use(function () {})
);
router.get("/login/setup", use(controller.setup));
router.get("/logout", use(controller.logout_get));
//router.get("/login-success", isAuth, controller.loginSuccess_get);

router.post(
	"/login",
	passport.authenticate("local", { failureRedirect: "/auth/login" }),
	function (req, res) {
		console.log(`${req.user.username} has logged in.`);
		res.redirect("/home");
	}
);
module.exports = router;
