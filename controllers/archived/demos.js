const getIndex = (req, res) => {
	res.sendStatus(200);
};
const getLogin = (req, res) => {
	res.render("pages/login.ejs");
};

module.exports = {
	getIndex,
	getLogin,
};
