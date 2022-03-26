const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);

  console.log(`Mongo DB connected: ${conn.connection.host}`.cyan.underline);
};

module.exports = connectDB;
