const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// make schema, defines structure
const userSchema = new Schema({
	discord: {
		id: String,
	username: String,
	avatar: String,
	discriminator: String,
	public_flags: Number,
	flags: Number,
	banner: String,
	banner_color: String,
	accent_color: String,
	locale: String,
	mfa_enabled: Boolean,
	provider: String,
	accessToken: String,
	guilds: [{
		id: String,
		name: String,
		icon: String,
		owner: Boolean,
		permissions: Number,
		features: [String],
		permissions_new: String,
	}, ],
	},
	admin:Boolean,
	
}, {
	timestamps: true
});

// create model based on schema
const User = mongoose.model("User", userSchema);

User.setup = async () => {
	// const exists = await User.exists({
	// 	username: process.env.super_USERNAME
	// });
	// if (exists) {
	// 	return false;
	// }
	// const saltHash = genPassword(process.env.super_PASSWORD);
	// const salt = saltHash.salt;
	// const hash = saltHash.hash;
	// new User({
	// 		username: process.env.super_USERNAME,
	// 		hash: hash,
	// 		salt: salt,
	// 		admin: true,
	// 	})
	// 	.save()
	// 	.then(() => {
	// 		console.log(
	// 			"An Administrator account has been created using .env super_USERNAME and super_PASSWORD."
	// 		);
	// 	});
	// return true;
};

module.exports = User;