const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://hasanarick:agK4GzcXmKDDRzCX@cluster0.tuis8.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const manufacturerCollection = client.db("manufacturer").collection("tools");

    app.get("/tools", async (req, res) => {
      const tools = await manufacturerCollection.find({}).toArray();
      res.send(tools);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  const hi = "hello manufacturer , What's up? arick";
  res.send(hi);
});
app.listen(port, () => {
  console.log("port is running manufacturer", port);
});
