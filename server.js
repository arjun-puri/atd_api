const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require('dotenv').config()

const port = process.env.SERVER_PORT || 3030

const sensors = require("./scripts/sensor")
const user = require("./scripts/user")

const app = express()

// app.use(bodyParser.json())
// app.use(
//     bodyParser.urlencoded({
//         extended: true,
//     })
// )

app.use(cors());

app.listen(port, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("Server running on port: " + port);
  }
});

// For handling account signups and signin
// app.post("/api/signup", user.userSignUp)
app.post("/api/signin", user.userSignIn)

// For fetching values between given dates (can be done without any authentication)
app.get("/api/sensors", sensors.sensorsGet);
// For sending values
app.post("/api/sensors", user.authenticateToken, sensors.sensorsPost);
