const mongoose = require("mongoose");

// Ensure environment variables are loaded
require("dotenv").config();

const MONGOOSE_URL = process.env.MONGO_URI;

const connectToMongo = async () => {
  try {
    await mongoose.connect(MONGOOSE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if unable to connect
  }
};

module.exports = connectToMongo;
