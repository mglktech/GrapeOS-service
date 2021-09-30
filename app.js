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
require("./config/strategies/discordStrategy");
require("./services/discord");
require("./bin/highlife-dragtimes");
require("./config/cron.js");
require("./config/newdbconfig").setup();
let app = express();
// DEFAULT CONFIGS
// app.use(express.static(path.join(__dirname, "public"))); // PUBLIC STATIC DIRECTORY

// app.set("views", path.join(__dirname, "views")); // set views directory
// app.set("view engine", "ejs"); // set view engine
// app.use(morgan); // VERBOSE CONSOLE LOGGING

// const sessionStore = MongoStore.create({
// 	mongoUrl: process.env.DB_STRING,
// });

// app.use(
// 	session({
// 		secret: "Some Random Secret",
// 		resave: false,
// 		saveUninitialized: false,
// 		store: sessionStore,
// 		cookie: {
// 			maxAge: 1000 * 60 * 60 * 2, // Equals 2 Hours
// 		},
// 	})
// );

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(express.urlencoded({ extended: true })); // EXTENDED URLENCODING FOR FORMS

// Index Routing
app.use("/", require("./routes/top"));
//app.use("/public", require("./routes/public"));
//app.use("/account", require("./routes/account"));
// app.use("/apps", require("./routes/apps"));
// app.use("/auth", require("./routes/auth"));
// app.use("/api", require("./routes/api"));
// //app.use("/articles", require("./routes/articles"));
// app.use("/bin", require("./routes/bin"));
//app.use("/protected", require("./routes/protected"));
//app.use("/projects", require("./routes/projects"));
//app.use("/demos", require("./routes/demos"));
app.use((err, req, res, next) => {
	res.status(404);
});

app.listen(PORT, () => logger.system(`Listening on ${PORT}`));
