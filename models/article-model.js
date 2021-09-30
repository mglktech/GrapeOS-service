const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// make schema, defines structure
const articleSchema = new Schema(
	{
		headerImage: String,
		title: String,
		subtitle: String,
		body: String,
		previousTitles: Array,
		project: {
			type: Schema.ObjectId,
			ref: "Project",
		},
		author: {
			type: Schema.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
);

// create model based on schema
const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
