// Gameservers = Associated content for a specific community
// in the case of Highlife Roleplay, information scrubbed from their discord server is associated with their live server IP.
// Model relevant player-related content from the discord server like roles,
// Associate roles with discord accounts
// Be able to check almost-live up to date information on each player on the server and their associated roles.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelName = "fivem-server";

const mySchema = new Schema({
	EndPoint: {
		type: String,
		required: true,
	},
	Flags: {
		tracked: Boolean,
		public: Boolean,
		lastSeen: Number,
		state: String,
		ready: {
			type: Boolean,
			default: true,
		},
	},
	Data: {
		clients: Number,
		gametype: String,
		hostname: String,
		mapname: String,
		iconVersion: Number,
		sv_maxclients: Number,
		enhancedHostSupport: Boolean,
		resources: [String],
		server: String,
		vars: {
			type: Map,
			of: Object,
		},
		selfReportedClients: Number,
		ownerID: Number,
		private: Boolean,
		fallback: Boolean,
		connectEndPoints: [String],
		upvotePower: Number,
		burstPower: Number,
		support_status: String,
		svMaxClients: Number,
		ownerName: String,
		ownerProfile: String,
		ownerAvatar: String,
		lastSeen: String,
	},
});

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.fetchAll = () => {
	return model.find();
};

model.getById = (id) => {
	//console.log("new method");
	return model.findById(id);
};
model.fetchByCfx = (cfxCode) => {
	return model.findOne({ EndPoint: cfxCode });
};

model.create = (item) => {
	return new model(item).save().then((res) => {
		doLog("fivem-server", `New Model Created. ${res._id}`);
		return res;
	});
};
model.modify = (id, contents) => {
	model.findByIdAndUpdate(id, contents);
};

model.setStatus = (sv, status) => {
	// sv = found server model, status = Online Status (bool)
	let retries = sv.retries;
	if (!status) {
		retries++;
		let name = sv.vars.sv_projectName || sv._id;
		console.log(
			`[fivem-server] -> ${name} has failed to respond after ${retries} retries.`
		);
	} else {
		retries = 0;
	}
	model.findByIdAndUpdate(sv._id, { status, retries }).exec();
};

function objectify(items) {
	try {
		let rtn = [];
		for (let item of items) {
			rtn.push(item.toObject({ flattenMaps: true }));
		}
		return rtn;
	} catch (err) {
		console.log(err);
		try {
			return items.toObject({ flattenMaps: true });
		} catch (err) {
			console.log(err);
			return items;
		}
	}
}

function doLog(service, text) {
	let logTxt = `[${service}] -> ${text}`;
	console.log(logTxt);
}
module.exports = model;
