const router = require("express").Router();


const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

router.use("/serverStatus", require("./apps/serverStatus"));
router.use("/spotify", require("./apps/spotify"));


module.exports = router;
