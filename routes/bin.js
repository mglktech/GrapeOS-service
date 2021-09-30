const router = require("express").Router();


const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
}; // real nice promise resolver would like to use here instead?
router.use("/fiveM", require("./bin/fiveM"));
router.use("/tasks", require("./bin/tasks"));
router.use("/icons", require("./bin/icons"));
router.use("/shortcuts", require("./bin/shortcuts"));
router.use("/files", require("./bin/files"));
router.use("/folders", require("./bin/folders"));


module.exports = router;
