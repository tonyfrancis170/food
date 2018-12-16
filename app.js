"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const glob = require("glob");
const cors = require("cors");
const chalk = require("chalk");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");

/* Global helpers */
const gg = require("./helpers/globals");
const config = require("./helpers/config");
/* Auth middlewares */
const auth = require("./helpers/auth");

/* Database setup */

config
  .dbConnect()
  .then(resp => {
    gg.log(chalk.green(resp));
  })
  .catch(err => {
    gg.log(chalk.red(err));
  });
mongoose.Promise = Promise;

app.enable("trust proxy");

app.use(helmet());
app.use(
  bodyParser.json({
    limit: "50mb"
  })
);

app.use(function(error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.json({
      errorTag: error.status,
      message: "invalid syntax"
    });
  } else {
    next();
  }
});

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);

// Sanitize queries

app.use((req, res, next) => {
  req.body = req.body ? mongoSanitize(req.body) : {};
  next();
});

// Ignore preflight requests

app.options("*", cors());
/* Make our app CORS safe */
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://food-is-life-e4fb4.firebaseapp.com"
  ); /* *.name.domain for production  */
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

/* REGISTER ROUTES HERE */

/* APIs which don't require authentication */
const openRouter = express.Router();
/* APIs which require authentication */
const apiRouter = express.Router();

/* Log requests to console */
app.use(morgan("dev"));

/* Fetch router files and apply them to our routers */
glob("./routes/*.router.js", null, (err, files) => {
  files.forEach(path => {
    require(path)(openRouter, apiRouter);
  });
});

/* Applying middleware to protected routes */
apiRouter.use(auth.gateKeep);

/* Registering our routes */
app.use("/api", apiRouter);
app.use("/", openRouter);

//  apply to all requests
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

app.use(limiter);

module.exports = app;
