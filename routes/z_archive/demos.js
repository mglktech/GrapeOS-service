const express = require("express");
const router = express.Router();
const controller = require("../../controllers/archived/demos");

router.get("/", controller.getIndex);
router.get("/login", controller.getLogin);

module.exports = router;
