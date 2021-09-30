const passport = require("passport");
const genPassword = require("../config/passwordUtils").genPassword;
const User = require("../models/user-model");

const setup = async (req, res) => {
	const exists = await User.exists({ username: process.env.super_USERNAME });
	if (exists) {
		console.log(
			"Someone tried to setup the super account but it has already been created!"
		);
		res.redirect("/auth/login");
		return;
	}
	const saltHash = genPassword(process.env.super_PASSWORD);
	const salt = saltHash.salt;
	const hash = saltHash.hash;
	const newUser = new User({
		username: process.env.super_USERNAME,
		hash: hash,
		salt: salt,
		admin: true,
	});

	console.log(`Creating admin account:`);
	newUser
		.save()
		.then((user) => {
			console.log(`ADMIN ACCOUNT CREATED: ${user}`);
			res.redirect("/auth/login");
		})
		.catch((err) => {
			console.log(`ERROR: 	${err}`);
			res.redirect("/");
		});
};

const login_get = (req, res) => {
	const response = {
		err: req.query.err,
	};
	res.render("pages/login", response);
};

const logout_get = (req, res) => {
	req.logout();
	res.redirect("/");
};

const loginSuccess_get = (req, res) => {
	res.render("pages/login-success");
};

module.exports = {
	login_get,
	logout_get,
	loginSuccess_get,
	setup,
};
