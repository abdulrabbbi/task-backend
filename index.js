const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
require('./config/passport');
const { StatusCodes } = require('http-status-codes');
const config = require("./config/env");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimiter");

const routes = require('./routes/index');
const {
  errorConverter,
  errorHandler,
} = require("./middlewares/errorMidleware");
const ApiError = require("./utils/apiError");

const app = express();

// enable cors
// In your backend
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// set security HTTP headers
app.use(helmet());
app.use(passport.initialize());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));


// logger
if (config.env !== "test") {
  app.use(morgan("combined"));
}



// jwt authentication
// app.use(passport.initialize());
// require("./config/passport");

if (config.env === "production") {
  app.use("/api", apiLimiter); // Apply to all API routes
  app.use("/auth", authLimiter); // Stricter limits for auth routes
}

// v1 api routes
app.use("/api", routes);

// send back a 404 error for any unknown api request

app.use((req, res, next) => {
  req.setTimeout(5000); // 5 second timeout
  res.setTimeout(5000);
  next();
});

app.use((req, res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, "Not found"));
});
// convert error to ApiError, if needed
app.use(errorConverter);
// handle error
app.use(errorHandler);

module.exports = app;
