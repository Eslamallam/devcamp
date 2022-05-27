const env = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// load env vars
env.config({ path: "./config/config.env" });

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const path = require("path");

// connect to DB
connectDB();

const app = express();

app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//file upload
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// handle unhandled rejection errors
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server & exit
  server.close(() => process.exit(1));
});
