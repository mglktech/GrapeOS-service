//const users = require("../models/user-model");
//const files = require("../models/file-model");
const playerModel = require("../models/fivem/fivem-player.js");
module.exports.setup = async () => {
	console.log(`Setup Started.`);
	//await users.setup();
	//await files.setup(); // File/folder structure needs to be ensured on init in case any of the defaults have changed.
	//await updatePlayerModels();
	console.log(`Setup Complete.`);
};

async function updatePlayerModels() {
	await playerModel.find({}).then((res) => {
		let count = 0;
		for (player of res) {
			// so I don't have to clear activity data this time
			if (typeof player.server != "undefined") {
				count++;
				playerModel
					.findByIdAndUpdate(player._id, {
						$unset: { server: "" },
						$set: { servers: [] },
					})
					.exec();
				//console.log(`${player.name} updated`);
			}
		}
		console.log(`${count} PlayerModels Updated`);
	});
}
