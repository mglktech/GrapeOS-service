require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan")(process.env.morgan_logLevel);
const PORT = process.env.PORT || 5001;
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;
//const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const logger = require("emberdyn-logger");
require("ejs");
require("./config/db");
//require("./config/strategies/discordStrategy");
//require("./services/discord");
require("./bin/highlife-dragtimes");
require("./config/cron.js");
require("./config/newdbconfig").setup();

let app = express();

app.use("/", require("./routes/top"));
app.use((err, req, res, next) => {
	res.status(404);
});

app.listen(PORT, () => logger.system(`Listening on ${PORT}`));
