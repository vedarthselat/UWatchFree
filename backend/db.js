const mongoose = require("mongoose");

const MONGOOSE_URL = "mongodb+srv://vedarth:selat@cluster0.csqpnfu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
