require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan")(process.env.morgan_logLevel);
const PORT = process.env.PORT || 5001;
const mongoose = require("mongoose");
const conn = process.env.DB_STRING;
// Connect to DB on boot
mongoose
	.connect(conn, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then(() => {
		console.log(`[MONGOOSE]: Database Connected.`);
		mongoose.set("useFindAndModify", false);
	})
	.catch((err) => {
		console.log(`Database Error: ${err}`);
	});
require("./bin/config").setup();
require("./bin/highlife-dragtimes");
require("./services/cron.js");

//require("ejs");

let app = express();

app.use("/", require("./routes/top"));
app.use((err, req, res, next) => {
	res.status(404);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
