const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyparser = require("body-parser");
const controllers = require("./src/contollers/contollers");
const routes = require("./src/routes/routes");
const router = require("./src/routes/routes");

const app = express();

// app.use(bodyparser.json());
app.use(express.json());

app.use(bodyparser.urlencoded({ extended: true }));
// app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());

const GenerateId = (type) => {
  const date = new Date();
  const timestamp = date.getTime();
  if (type) {
    let userid = "RET" + timestamp;
    return userid;
  } else {
    let userid = "USR" + timestamp;
    return userid;
  }
};

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "password",
  database: "shopping_cart",
});

// (req, res) => {
//     console.log(req.body);
//     const username = req.body.username;
//     const email = req.body.email;
//     const phone = req.body.phone;
//     const password = req.body.password;
//     const retailer = req.body.retailer;
//     const userID = GenerateId(retailer);

//     db.query(
//       "INSERT INTO users(userID,username,email,phone,passcode) VALUES(?,?,?,?,?)",
//       [userID, username, email, phone, password],
//       (error, results) => {
//         if (error) {
//           console.error(error);
//           res.status(500).json("An error occurred");
//         } else {
//           console.log(results);
//           res.status(200).json("Data inserted successfully");
//         }
//       }
//     );
//   }

// app.use("/", routes);

require("./src/routes/routes")(app, router);

// app.get("/getcartdata", (req, res) => {
//     const { userID } = req.query;
//     console.log(userID);

//     res.json({ message: "Data received successfully" });
//   });
const port = app.listen(8080, () => {
  console.log("Server is running on 8080 port.");
});
