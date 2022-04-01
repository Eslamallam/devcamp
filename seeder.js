const fs = require("fs");
const mongoose = require("mongoose");
const env = require("dotenv");
const colors = require("colors");

// load env vars
env.config({ path: "./config/config.env" });

// load models
const Bootcamps = require("./models/Bootcamp");

// connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

// Import data into DB
const importData = async () => {
  try {
    await Bootcamps.create(bootcamps);

    console.log("Data imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete
const deleteData = async () => {
  try {
    await Bootcamps.deleteMany();

    console.log("Data deleted...".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
