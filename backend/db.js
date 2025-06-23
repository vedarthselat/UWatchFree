const mongoose = require("mongoose");

const MONGOOSE_URL = "mongodb://127.0.0.1:27017/UWatchFree";

const connectToMongo = async () => {
  try {
    await mongoose.connect(MONGOOSE_URL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectToMongo;
