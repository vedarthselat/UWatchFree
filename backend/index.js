// Load environment variables from .env
require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");

// Connect to MongoDB
connectToMongo();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/movies", require("./movies_route"));
app.use("/api/users", require("./users_route"));
app.use("/api/towatchlist", require("./towatchlist_route"));
app.use("/api/completedwatchlist", require("./completedwatchlist_route"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Invalid endpoint" });
});

// Use environment PORT or fallback to 4000
const port = process.env.PORT || 4000;

// Start server
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
