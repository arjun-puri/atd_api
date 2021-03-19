const { Pool, Client } = require("pg")
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
require("dotenv").config()

// authenticate token middleware
function authenticateToken(req, res, next) {
    // get the JWT access token from header
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader.split(" ")[1];
  
      if (token == null) {
        res.status(401).json({ message: "no token supplied!" })
      } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
          if (err) {
              console.error(err)
            res.status(403).json({ message: "incorrect token" })
          }
          res.locals.authData = authData;
          next();
        });
      }
    } catch (err) {
      console.error(err)
      return res.json({
        message: "something went wrong...",
      });
    }
  }

const userSignUp = (req, res) => { // temp open 
    const pool = new Pool()

    var query1 = {
        text: "select id from users order by id desc limit 1",
    }
    var query2 = {
        text: "insert into users values ($1, $2, $3, $4)",
<<<<<<< HEAD
        values: [-1, req.query.name, bcrypt.hashSync(req.headers["password"], 12), req.headers["email"]]
=======
        values: [-1, req.query.name, bcrypt.hashSync(req.headers["passowrd"], 12), req.headers["email"]]
>>>>>>> e7e51d9d9d5bab15fa0c3368f90521ff7eb2a6f7
    }

    pool.connect().then((client) => {
        return client.query(query1).then(data => {
            query2.values[0] = data.rows[0].id + 1;
        }).catch(err => {
            console.error(err);
            client.release();
            res.status(400).json({ message: 'Bad Request'})
        })
        .then(() => {
            pool.connect().then((client) => {
                return client.query(query2).then(() => {
                    res.status(201).json({ message: 'User created!' })
                })
            })
        })
    })

}

const userSignIn = (req, res) => {
    const pool = new Pool()

    var query1 = {
        text: "select * from users where email in ($1)",
        values: [req.headers["email"]]
    }

    pool.connect().then((client) => {
        return client.query(query1).then(data => {
            if(data.rows.length == 0) {
                res.status(401).json({ message: "user not found!" })
            }
            if(bcrypt.compareSync(req.headers["password"], data.rows[0].password)) {
                let user = {
                    name: data.rows[0].name,
                    email: data.rows[0].email,
                }
                jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: "300s" }, (err, token) => {
                    if(err) {
                        console.error(err)
                        client.release()
                    }
                    res.status(200).json({ user, token })
                    client.release()
                })
            }
            else {
                res.status(401).json({ message: "incorrect password!"})
                client.release()
            }
            
        })
    }).catch(err => {
        console.error(err)
        client.release();
    })
}

module.exports = {
    authenticateToken,
    userSignUp,
    userSignIn,
}