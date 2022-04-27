var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var ivrRouter = require("./routes/ivr");
var hangupRouter = require("./routes/hangup");
var authRouter = require("./routes/auth");

var app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/ivr", ivrRouter);
app.use("/hangup", hangupRouter);
app.use("/auth", authRouter);

module.exports = app;
