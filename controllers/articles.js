const Article = require("../models/article-model");
const fs = require("fs");

const md = require("markdown-it")({
	html: true,
	linkify: true,
	typographer: true,
}).use(require("markdown-it-checkbox"));

const test = async (req, res) => {
	console.log(req.isAuthenticated());

	let file = fs.readFileSync("./test_.md");
	//console.log(file.toString());
	let content = md.render(file.toString());
	//console.log(content);
	res.render("./pages/article.ejs", { article: content });
};
const new_get = (req, res) => {
	res.render("./pages/article-new.ejs");
};
const new_post = (req, res) => {
	const body = req.body;
	const newArticle = new Article({
		headerImage: body.headerImg,
		title: body.title,
		subtitle: body.subtitle,
		body: body.markdown,
	});
	newArticle
		.save()
		.then((article) => {
			console.log(`ARTICLE SAVED: `);
			console.log(article);
			res.redirect(`/articles/${article.title}`);
		})
		.catch((err) => {
			console.log(`SAVE ERROR: `);
			console.log(err);
			res.redirect("/");
		});
};

const article_get = (req, res) => {
	let title = req.params.title;
	Article.findOne({ title })
		.then((result) => {
			let convertedContent = md.render(result.body.toString());
			let article = {
				headerImage: result.headerImage,
				title: result.title,
				subtitle: result.subtitle,
				body: convertedContent,
			};
			res.render("./pages/article.ejs", { article });
		})
		.catch((err) => {
			res.status(404).send("Article not found");
		});
};

module.exports = { test, new_get, new_post, article_get };
