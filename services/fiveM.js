const axios = require("axios");

const DEFAULT_OPTIONS = {
	timeout: 5000,
};

class Server {
	constructor(ip, options) {
		if (!ip) throw Error("Please provide an IP.");
		this.ip = ip;
		this.options = Object.assign(DEFAULT_OPTIONS, options);
	}
	getCfx() {
		return new Promise((send, err) => {
			axios
				.get(
					`https://servers-frontend.fivem.net/api/servers/single/${this.ip}`,
					{
						timeout: this.options.timeout,
					}
				)
				.then(function (body) {
					send(body.data);
					//err("Error: forced error");
				})
				.catch(function (error) {
					err(error);
				});
		});
	}

	// getInfo_prune() {
	// 	return new Promise((send, err) => {
	// 		axios
	// 			.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
	// 			.then(function (body) {
	// 				//let info = body.data;
	// 				let vars = new Map(Object.entries(body.data.vars));
	// 				let info = {
	// 					resources: body.data.resources,
	// 					enhancedHostSupport: body.data.enhancedHostSupport,
	// 					//icon: body.data.icon,
	// 					online: true,
	// 					server: body.data.server,
	// 					vars,
	// 				};
	// 				send(info);
	// 			})
	// 			.catch(function (error) {
	// 				err(error);
	// 			});
	// 	});
	// }
	// getVars() {
	// 	return new Promise((send, err) => {
	// 		axios
	// 			.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
	// 			.then(function (body) {
	// 				//let info = body.data;
	// 				let vars = new Map(Object.entries(body.data.vars));
	// 				send(vars);
	// 			})
	// 			.catch(function (error) {
	// 				err(error);
	// 			});
	// 	});
	// }
}

module.exports.Server = Server;
