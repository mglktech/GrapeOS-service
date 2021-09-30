const express = require("express");
const router = express.Router();
const controller = require("../../controllers/projects");
const isAuth = require("../../config/auth").isAuth;
const isAdmin = require("../../config/auth").isAdmin;
//const marked = require("marked");
//const markdown = require("markdown").markdown;
const fs = require("fs");
const hljs = require("highlight.js");
const md = require("markdown-it")({
	html: true,
	linkify: true,
	typographer: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		return ""; // use external default escaping
	},
}).use(require("markdown-it-checkbox"));

// const createDomPurify = require("dompurify");
// const { JSDOM } = require("jsdom");
// const dompurify = createDomPurify(new JSDOM.window());
router.get("/", controller.index_get);
router.get("/test", controller.test);
router.get("/new", isAdmin, controller.new_get);
router.get("/:title", controller.project_get);
router.post("/new", isAdmin, controller.new_post);

module.exports = router;
