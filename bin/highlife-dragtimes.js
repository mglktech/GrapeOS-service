const client = require("../config/api/discord");
const fetchAll = require("discord-fetch-all");
const model = require("../models/hl-dragtime-model");
const logger = require("emberdyn-logger");
const text_live_dragtimes = "858368582759743518";

async function SynchronizeAllMessages(channel) {
	const allMessages = await fetchAll.messages(channel, {
		reverseArray: true, // Reverse the returned array
		userOnly: false, // Only return messages by users
		botOnly: true, // Only return messages by bots
		pinnedOnly: false, // Only returned pinned messages
	});
	for (message of allMessages) {
		const dragTime = parseMessage(message);
		new model(dragTime).save().then((result) => {
			logger.info(
				"[HL_DRAGTIME]: Sync : New Drag Time logged for " + dragTime.rp_name
			);
		});
		//console.log(dragTime);
		//console.log(ar);
	}
}

client.on("ready", () => {
	SyncHighlifeDragTimes();
});

const SyncHighlifeDragTimes = async () => {
	logger.info("[HL_DRAGTIME]: Syncing Highlife Drag Times...");
	const channel = await client.channels.fetch(text_live_dragtimes);
	//console.log(channel);
	// Synchronization Check can be done using channel.lastMessageID
	if (!(await model.exists({ messageID: channel.lastMessageID }))) {
		await SynchronizeAllMessages(channel);
	}
	logger.info("[HL_DRAGTIME]: Sync Complete.");
};

client.on("message", (message) => {
	// console.log(
	// 	`message recieved: channel_id: ${message.channel.id} compared to ${text_live_dragtimes}`
	// );
	if (message.channel.id == text_live_dragtimes) {
		let dragTime = parseMessage(message);
		const newDragTime = new model(dragTime);
		newDragTime.save().then(() => {
			logger.info(
				"[HL_DRAGTIME]: New Drag Time logged for " + dragTime.rp_name
			);
		});
	}
});

const parseMessage = (message) => {
	let messageID = message.id;
	let m = message.content;
	let ts = message.createdTimestamp;
	let ar = m.split(" "); // First, split into strings with no spaces and iterate through looking for patterns
	let name = `${ar[1]} ${ar[2]}`;
	let [lim1, lim2] = [ar.indexOf("vehicle:") + 1, ar.indexOf("(0-60:")];
	let vehicleStr = "";
	for (let i = lim1; i < lim2; i++) {
		vehicleStr += ar[i] + " ";
	}
	let vehicle = vehicleStr.substr(0, vehicleStr.length - 2);
	let [zeroSixtyIndex, zeroHundredIndex, qMileIndex, hMileIndex] = [
		ar.indexOf("(0-60:") + 1,
		ar.indexOf("0-100:") + 1,
		ar.indexOf("Mile:") + 1,
		ar.length - 1,
	];
	let dragTime = {
		messageID,
		timestamp: ts,
		rp_name: name,
		vehicle,
		zero_sixty:
			parseFloat(ar[zeroSixtyIndex].substr(0, ar[zeroSixtyIndex].length - 2)) ||
			-1,
		zero_hundred:
			parseFloat(
				ar[zeroHundredIndex].substr(0, ar[zeroHundredIndex].length - 2)
			) || -1,
		q_mile:
			parseFloat(ar[qMileIndex].substr(0, ar[qMileIndex].length - 2)) || -1,
		h_mile:
			parseFloat(ar[hMileIndex].substr(0, ar[hMileIndex].length - 2)) || -1,
	};
	return dragTime;
};
