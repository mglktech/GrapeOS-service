const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// make schema, defines structure
const projectSchema = new Schema(
	{
		headerImage: String,
		title: String,
		subtitle: String,
		previousTitles: Array,
		author: {
			type: Schema.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
);

// create model based on schema
const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
