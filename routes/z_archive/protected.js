const express = require("express");
const router = express.Router();
const isAuth = require("../config/auth").isAuth;
const isAdmin = require("../config/auth").isAdmin;
const db = require("../config/db");

router.get("/tasks/add", isAdmin, (req, res) => {
	res.render("pages/add-task");
});
router.post("/tasks/add", isAdmin, (req, res) => {
	const task = {
		name: req.body.name,
		exp: req.body.exp,
		cmd: req.body.cmd,
		data: JSON.parse(req.body.data),
		enabled: false,
	};
	db.addCron(task);
	res.redirect("/protected/tasks/view");
});

router.get("/tasks/view", isAdmin, async (req, res) => {
	let tasks = await db.getCrons();
	res.render("pages/view-tasks", { tasks });
});
router.get("/tasks/info/:id", isAdmin, async (req, res) => {
	let task = await db.getCron(req.params.id);
	res.render("pages/task-info", { task });
});
router.get("/tasks/get", isAdmin, async (req, res) => {
	let tasks = await db.getCrons();
	//console.log(tasks);
	res.json(tasks);
});
router.get("/tasks/toggle/:id", isAdmin, async (req, res) => {
	await db.toggleCron(req.params.id);
	res.redirect("/protected/tasks/view");
});
router.get("/tasks/delete/:id", isAdmin, async (req, res) => {
	await db.delCron(req.params.id);
	res.redirect("/protected/tasks/view");
});

module.exports = router;
