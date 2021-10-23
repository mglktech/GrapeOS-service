//const users = require("../models/user-model");
//const files = require("../models/file-model");
const playerModel = require('../models/fivem/fivem-player.js');
module.exports.setup = async () => {
	console.log(`Setup Started.`);
	//await users.setup();
	//await files.setup(); // File/folder structure needs to be ensured on init in case any of the defaults have changed.
	//await updatePlayerModels();
	console.log(`Setup Complete.`);
};

async function updatePlayerModels() {
	console.log('Updating Player Models');
	const players = await playerModel.find({});
	let count = 0;
	console.log(`Processing ${players.length} records...`);
	for (let player of players) {
		// so I don't have to clear activity data this time
		count++;
		await playerModel
			.findByIdAndUpdate(player._id, {
				$unset: { server: '' },
			})
			.exec();
		console.log(`${player.name} updated`);
	}
	console.log(`${count} PlayerModels Updated`);
}
