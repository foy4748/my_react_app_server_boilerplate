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
const { MongoClient, ObjectId, ServerApiVersion } = mongodb;
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
app.use(cookieParser("some_secret_untold"));
app.use(cors(corsOptions));
app.use(morgan("tiny"));

//-----------------------------------------

//---------------- Middleware Functions -------------------

//
const authGuard = async (req, res, next) => {
  const { authtoken } = req.headers;
  try {
    const decoded = jwt.verify(authtoken, SECRET_JWT);
    if (decoded) {
      res.decoded = {};
      res.decoded = decoded;
      next();
    } else {
      res
        .status(403)
        .send({ error: true, message: "Unauthorized action attempted" })
        .end();
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(403)
      .send({ error: true, message: "Auth-z failed. Invalid Token" })
      .end();
  }
};
//-----------------------------------------

//---------------- CONNECT MONGODB -------------------

const client = new MongoClient(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const productsCollection = client
    .db("TESTDATA")
    .collection("ema_john_products");
  const paymentsCollection = client.db("TESTDATA").collection("payments");

  // --------------- API END POINTS / REQUEST HANDLERS ---------
  app.get("/", authGuard, async (req, res) => {
    try {
      const query = { uid: res.decoded.uid };
      const data = await paymentsCollection.find(query).toArray();

      res.status(200).send({
        error: false,
        message: "SERVER is UP and Running",
        data,
      });
    } catch (error) {
      console.error(error);
      res.status(501).send({ error: true, message: "Query Failed" });
    }
  });

  // Token Signing API END point
  app.get("/auth", async (req, res) => {
    const { uid } = req.headers;
    if (uid) {
      const authtoken = jwt.sign({ uid }, SECRET_JWT);
      /*
  res.cookie("authtoken", JSON.stringify(authtoken), {
    httpOnly: true,
    secure: true,
  });
  */
      res.status(200).send({ error: false, authtoken });
    } else {
      res.status(404).send({ error: true, message: "No UID was provided" });
    }
  });

  // TEST POST DATA API END point
  app.post("/test-post", authGuard, async (req, res) => {
    try {
      const payLoad = req.body;
      const uid = res.decoded.uid;
      payLoad["uid"] = uid;
      const response = await paymentsCollection.insertOne(payLoad);
      res.status(200).send(response);
    } catch (error) {
      console.error(error);
      res.status(501).send({ error: true, message: "POST failed" });
    }
  });

  // TEST DELETE DATA API END point
  app.delete("/test-delete", authGuard, async (req, res) => {
    try {
      const uid = res.decoded.uid;
      const query = {
        _id: ObjectId(req.headers.delete_id),
        uid: res.decoded.uid,
      };
      const response = await paymentsCollection.deleteOne(query);
      res.status(200).send(response);
    } catch (error) {
      console.error(error);
      res.status(501).send({ error: true, message: "DELETE failed" });
    }
  });
}

run().catch((error) => console.error(error));
app.listen(PORT, () => console.log(`SERVER is running at port: ${PORT}`));
