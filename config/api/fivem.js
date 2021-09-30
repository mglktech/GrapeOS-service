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
	getPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/players.json`, {
					timeout: this.options.timeout,
				})
				.then(function (body) {
					let players = body.data;
					send(players);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}
	getInfo() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let info = body.data;
					send(info);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}
	getPlayersAll() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/players.json`, {
					timeout: this.options.timeout,
				})
				.then(function (body) {
					let players = body.data;
					send(players);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}
	getServerStatus() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let server_status = {
						online: true,
					};
					send(server_status);
				})
				.catch(function (error) {
					let server_status = {
						online: false,
						url: error.config.url,
						method: error.config.method,
					};
					if (error.response == undefined) send(server_status);
				});
		});
	}
	getMaxPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let maxClients = body.data.vars.sv_maxClients;
					send(maxClients);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}

	getInfo() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let info = body.data;
					send(info);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}
	getInfo_prune() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					//let info = body.data;
					let vars = new Map(Object.entries(body.data.vars));
					let info = {
						resources: body.data.resources,
						enhancedHostSupport: body.data.enhancedHostSupport,
						//icon: body.data.icon,
						online: true,
						server: body.data.server,
						vars,
					};
					send(info);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}
	getVars() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					//let info = body.data;
					let vars = new Map(Object.entries(body.data.vars));
					send(vars);
				})
				.catch(function (error) {
					err(error);
				});
		});
	}
}

module.exports.Server = Server;
