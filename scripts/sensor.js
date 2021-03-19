// const environment = process.env.NODE_ENV || "development"; // set environment
// const configuration = require("../knexfile")[environment]; // pull in correct db with env configs
// const database = require("knex")(configuration); // define database based on above

const { Pool, Client } = require("pg");
const moment = require("moment");

const sensorsGet = (request, response) => {
  const sensorsReq = request.query;
  const start_date = sensorsReq.start_date + " +0000";
  const end_date = sensorsReq.end_date + " +0000";

  const pool = new Pool();
  const query = {
    text: "SELECT * FROM SENSORS WHERE added_at BETWEEN $1 AND $2",
    values: [start_date, end_date],
  };

  pool.connect().then((client) => {
    return client
      .query(query)
      .then((data) => {
        client.release();
        response.status(200).json({ authData: response.locals.authData, data: data.rows });
      })
      .catch((err) => {
        console.error(err);
        client.release();
        response.status(400).json({ message: "Bad Request" });
      });
  });
};

const sensorsPost = (request, response) => {
  const sensorsSend = request.query;
  const pool = new Pool();

  // getting last entry id
  const query1 = { text: "SELECT ID FROM SENSORS ORDER BY ID DESC LIMIT 1" };
  var query2 = {
    text: "INSERT INTO SENSORS VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    values: [
      0,
      moment().format("YYYY-MM-DD hh:mm:ss") + " +0000",
      sensorsSend.load_sensor,
      sensorsSend.acc_x,
      sensorsSend.acc_y,
      sensorsSend.acc_z,
      sensorsSend.ultra,
      sensorsSend.alert,
    ],
  };

  pool
    .connect()
    .then((client) => {
      return client.query(query1).then((data) => {
        query2.values[0] = data.rows[0].id + 1;
        // console.log(query2.values[0]);
        client.release();
      })
      .catch((err) => {
        console.error(err)
        client.release();
        response.status(400).json({ message: "Bad Request" });
      })
    })
    .then(() => {
      pool.connect().then((client) => {
        return client
          .query(query2)
          .then((data) => {
            client.release();
            response
              .status(200)
              .json({ authData: response.locals.authData, data });
          })
          .catch((err) => {
            console.error(err);
            client.release();
            response.status(400).json({ message: "Bad Request" });
          });
      });
    }).catch(err => {
      console.error(err);
    })
};

module.exports = {
  sensorsGet,
  sensorsPost,
};
