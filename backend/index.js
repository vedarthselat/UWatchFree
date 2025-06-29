require('dotenv').config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
connectToMongo();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Your valid API route
app.use("/api/movies", require("./movies_route"));
app.use("/api/users", require("./users_route"));
app.use("/api/towatchlist", require("./towatchlist_route"));
app.use("/api/completedwatchlist", require("./completedwatchlist_route"));

app.use((req, res) => {
  res.status(404).json({ error: "Invalid endpoint" });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
