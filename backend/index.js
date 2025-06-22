const connectToMongo = require("./db");
const express = require("express");

connectToMongo();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 4000;
app.listen(port, () => {
  console.log(`listening to port http://localhost:${port}`);
});
