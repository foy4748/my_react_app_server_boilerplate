// Import Packages
const express = require("express");
const mongodb = require("mongodb");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
//-----------------------------------------

// -------------------- Initializations --------------------
require("dotenv").config(); // dotenv
const app = express(); // express
const { MongoClient, ObjectId } = mongodb;
//-----------------------------------------

//------------------- Accessing Secrets --------------------
const PORT = process.env.PORT || process.env.DEV_PORT;
const { SECRET_JWT, DB_URI } = process.env;
//-----------------------------------------

// Middleware options
const corsOptions = {
  origin: process.env.CLIENT_ADDRESS || process.env.DEV_CLIENT,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  withCredentials: true,
};

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan("tiny"));

//-----------------------------------------

//---------------- Middleware Functions -------------------

//
const authGuard = async (req, res, next) => {
  const { authtoken } = req.headers;
  const { uid } = req.query;
  try {
    const decoded = jwt.verify(authtoken, SECRET_JWT);
    if (decoded.uid === uid) {
      res.decoded = {};
      res.decoded = decoded;
      next();
    } else {
      res.send({ error: true, message: "Unauthorized action attempted" }).end();
    }
  } catch (error) {
    console.error(error.message);
    res.send({ error: true, message: "Auth-z failed. Invalid Token" }).end();
  }
};
//-----------------------------------------

//---------------- CONNECT MONGODB -------------------

// Collections
let productsCollection;
//--------------------

MongoClient.connect(DB_URI, function (err, client) {
  if (err) {
    console.error("DB connection failed");
    console.error(err);
  }

  productsCollection = client.db("TESTDATA").collection("ema_john_products");
  console.log("DB CONNECTED");
});

//-----------------------------------------

// --------------- API END POINTS / REQUEST HANDLERS ---------
app.get("/", authGuard, async (req, res) => {
  const data = await productsCollection.find({}).toArray();

  res.status(200).send({
    error: false,
    message: "SERVER is UP and RUnning",
    decoded: res.decoded,
    data,
  });
});

// Token Signing API END point
app.get("/auth", async (req, res) => {
  const { uid } = req.headers;
  const authtoken = jwt.sign({ uid }, SECRET_JWT);
  /*
  res.cookie("authtoken", JSON.stringify(authtoken), {
    httpOnly: true,
    secure: true,
  });
  */
  res.status(200).send({ error: false, authtoken });
});

app.listen(PORT, () => console.log(`SERVER is running at port: ${PORT}`));
