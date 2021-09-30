const Project = require("../models/project-model");
const hljs = require("highlight.js");
// const md = require("markdown-it")({
// 	html: true,
// 	linkify: true,
// 	typographer: true,
// 	highlight: function (str, lang) {
// 		if (lang && hljs.getLanguage(lang)) {
// 			try {
// 				return hljs.highlight(lang, str).value;
// 			} catch (__) {}
// 		}

// 		return ""; // use external default escaping
// 	},
// }).use(require("markdown-it-checkbox"));

// Blog.find()
// 		.sort({ createdAt: -1 }) // sort by created descending
// 		.then((result) => {
// 			res.render("blogs/index", { title: "Blogs", blogs: result });
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 		});

const index_get = (req, res) => {
	Project.find()
		.sort({ createdAt: -1 })
		.then((projects) => {
			res.render("./pages/projects", { projects });
		})
		.catch((err) => {
			console.log(err);
		});
};

const test = (req, res) => {
	res.send("Projects Route Test");
};
const new_get = (req, res) => {
	res.render("./pages/project-new.ejs");
};
const new_post = (req, res) => {
	const body = req.body;
	const newProject = new Project({
		headerImage: body.headerImg,
		title: body.title,
		subtitle: body.subtitle,
	});
	newProject
		.save()
		.then((project) => {
			console.log(`PROJECT SAVED: `);
			console.log(project);
			res.redirect(`/projects/${project.title}`);
		})
		.catch((err) => {
			console.log(`SAVE ERROR: `);
			console.log(err);
			res.redirect("/");
		});
};

const project_get = (req, res) => {
	let title = req.params.title;
	Project.findOne({ title })
		.then((result) => {
			let project = {
				headerImage: result.headerImage,
				title: result.title,
				subtitle: result.subtitle,
			};
			res.send(project);
		})
		.catch((err) => {
			res.status(404).send("Project not found");
		});
};

module.exports = { index_get, test, new_get, new_post, project_get };
