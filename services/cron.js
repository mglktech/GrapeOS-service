const CronJobManager = require("cron-job-manager");
const cronTaskModel = require("../models/crontask-model");
const controller = require("../controllers/cron");
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
		console.log(`CRON Task ${task.name} has been created. (${task.cmd})`);
	}
};

let manager = new CronJobManager("head", "* * * * * *", syncTasks, {
	// Create a Head CRON to run all other jobs
	start: true,
});

module.exports = manager;
