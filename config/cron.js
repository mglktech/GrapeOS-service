const CronJobManager = require("cron-job-manager");
const cronTaskModel = require("../models/crontask-model");
const controller = require("../controllers/cron");
const api = require("../controllers/api.js");
const logger = require("emberdyn-logger");
//const db = require("../config/db");

const syncTasks = async () => {
	let tasks = await cronTaskModel.getAll();
	for (let task of tasks) {
		syncTaskToEnabledFlag(task);
	}
};

const syncTaskToEnabledFlag = (task) => {
	if (!manager.exists(task._id.toString())) {
		createTask(task);
		return;
	}
	let id = task._id.toString();
	let running = manager.jobs[id].running || false;
	let enabled = task.enabled;
	if (running == false && enabled == true) {
		manager.jobs[id].start();
		console.log(`CRON Task ${task.name} Started.`);
	}
	if (running == true && enabled == false) {
		manager.jobs[id].stop();
		console.log(`CRON Task ${task.name} Stopped.`);
	}
};

const createTask = (task) => {
	if (task.cmd == "pingFiveMServers") {
		manager.add(task._id.toString(), task.exp, function () {
			controller.pingFiveMServers();
		});
		console.log(`CRON Task ${task.name} has been created. (pingFiveMServer)`);
	}
	if (task.cmd == "pingFiveMServerNew") {
		manager.add(task._id.toString(), task.exp, async function () {
			controller.pingFiveMServer(task.data.id);
		});
		console.log(`CRON Task ${task.name} has been created. (pingFiveMServer)`);
	}
	if (task.cmd == "pingScrobbler") {
		manager.add(task._id.toString(), task.exp, function () {});
		console.log(`CRON Task ${task.name} has been created. (pingScrobbler)`);
	}
};

const scheduledTasks = [
	// {
	// 	exp: "*/30 * * * * *",
	// 	cmd: "pingFiveMServer",
	// 	data: {
	// 		// Data structure depends on the cmd given.
	// 		id: "60e454bed30b9e2538de42cd", // Highlife server ID on Dev
	// 	},
	// 	active: true,
	// },
	// {
	// 	exp: "*/5 * * * * *",
	// 	cmd: "pingScrobbler",
	// 	data: {
	// 		// Data structure depends on the cmd given.
	// 		user: "mglkdottech",
	// 		api_key: "f2ef563e9f5436998cf6a5139b902bf1", // Highlife server ID on Dev
	// 	},
	// 	active: true,
	// },
];

let manager = new CronJobManager("head", "* * * * * *", syncTasks, {
	start: true,
});

module.exports = manager;
