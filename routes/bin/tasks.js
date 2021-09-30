let router = require("express").Router();
const isAdmin = require("../../config/auth").isAdmin;
const cron = require("../../models/crontask-model");

const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

router.get(
	"/view",
	isAdmin,
	use(async (req, res) => {
		let tasks = await cron.getAll();
		res.render("bin/task-manager/view-tasks", { tasks });
	})
);
router.get(
	"/add",
	isAdmin,
	use((req, res) => {
		res.render("bin/task-manager/add-task");
	})
);
router.get(
	"/info/:id",
	isAdmin,
	use(async (req, res) => {
		let task = await cron.getById(req.params.id);
		res.render("bin/task-manager/task-info", { task });
	})
);
/*
----JSON responses----
*/
router.get(
	"/get",
	isAdmin,
	use(async (req, res) => {
		let tasks = await cron.getAll();
		//console.log(tasks);
		res.json(tasks);
	})
);
/*
 ----Redirects----
*/
router.post(
	"/add",
	isAdmin,
	use((req, res) => {
		const task = {
			name: req.body.name,
			exp: req.body.exp,
			cmd: req.body.cmd,
			data: JSON.parse(req.body.data),
			enabled: false,
		};
		cron.add(task);
		res.redirect("/bin/tasks/view");
	})
);
router.get(
	"/toggle/:id",
	isAdmin,
	use(async (req, res) => {
		await cron.toggle(req.params.id);
		res.redirect("/bin/tasks/view");
	})
);
router.get(
	"/delete/:id",
	isAdmin,
	use(async (req, res) => {
		await cron.delete(req.params.id);
		res.redirect("/bin/tasks/view");
	})
);
module.exports = router;