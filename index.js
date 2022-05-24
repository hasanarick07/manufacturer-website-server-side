const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");

app.get("/", (req, res) => {
  const hi = "hello manufacturer , What's up? arick";
  res.send(hi);
});
app.listen(port, () => {
  console.log("port is running manufacturer", port);
});
