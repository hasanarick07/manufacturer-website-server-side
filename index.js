const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tuis8.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyjwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    // console.log(decoded);
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const manufacturerCollection = client
      .db("manufacturer")
      .collection("tools");
    const orderCollection = client.db("manufacturer").collection("orders");
    const usersCollection = client.db("manufacturer").collection("users");
    const ratingsCollection = client.db("manufacturer").collection("ratings");

    app.get("/tools", async (req, res) => {
      const tools = await manufacturerCollection.find({}).toArray();
      res.send(tools);
    });
    app.get("/tool/:id", verifyjwt, async (req, res) => {
      // console.log(req.body,'hi');
      const query = { _id: ObjectId(req.params.id) };
      const tools = await manufacturerCollection.findOne(query);
      res.send(tools);
    });
    app.post("/order", async (req, res) => {
      const order = req.body;
      // console.log("hi ", req.body.email);
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
    });
    app.get("/order", verifyjwt, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const orders = await orderCollection.find(query).toArray();
        return res.send(orders);
      } else {
        return res.status(403).send({ message: "Forbidden Access" });
      }
    });
    app.delete("/order/:email", verifyjwt, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      // console.log(user)
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30d" }
      );
      res.send({ result, token });
    });
    app.get("/user/:email", verifyjwt, async (req, res) => {
      const email = req.params.email;
      // console.log(email)
      const user = await usersCollection.findOne({ email: email });
      res.send(user);
    });
    app.post("/rating", async (req, res) => {
      const rating = req.body;
      const result = await ratingsCollection.insertOne(rating);
      res.send({ success: true, result });
    });
    app.get("/ratings", async (req, res) => {
      const ratings = await ratingsCollection.find({}).toArray();
      res.send(ratings);
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
