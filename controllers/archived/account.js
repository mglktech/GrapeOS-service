const genPassword = require("../config/passwordUtils").genPassword;
const User = require("../models/user-model");

const setup = async (req, res) => {
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
	console.log(newUser);
	newUser
		.save()
		.then((user) => {
			console.log(`ADMIN ACCOUNT CREATED: ${user}`);
			res.redirect("/account/login");
		})
		.catch((err) => {
			console.log(`ERROR: 	${err}`);
			res.redirect("/account/login");
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

const create_get = (req, res) => {
	res.status(404);
};

const prot_home_get = (req, res) => {
	if (req.isAuthenticated() && req.user.admin) {
		res.render("pages/index_admin");
		return;
	}
	if (req.isAuthenticated()) {
		res.render("pages/index_auth");
		return;
	}
	res.status(404).send("You are not authorised to view this content.");
};

module.exports = {
	login_get,
	logout_get,
	prot_home_get,
	create_get,
	setup,
};
