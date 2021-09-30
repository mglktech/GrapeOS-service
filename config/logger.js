//https://github.com/emberdyn-code/emberdyn-logger/blob/master/config/logger.js by Emberdyn
module.exports = {
	levels: {
		access: {
			color: "magenta",
			fileModes: ["production", "prod"],
		},
		warn: {
			color: "yellowBright",
			fileModes: ["production", "prod"],
		},
		system: {
			color: "blue",
			fileModes: ["production", "prod"],
		},
		database: {
			color: "cyan",
			fileModes: ["production", "prod"],
		},
		info: {
			color: "green",
			fileModes: ["production", "prod"],
		},
		debug: {
			color: "cyan",
			fileModes: ["production", "prod"],
		},
		event: {
			color: "magenta",
			fileModes: ["production", "prod"],
		},
		error: {
			color: "red",
			fileModes: ["production", "prod"],
		},
		fatal: {
			color: "redBright",
			fileModes: ["production", "prod"],
		},
	},
};
