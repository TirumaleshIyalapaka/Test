const mysql = require("mysql");

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

exports.usersignup = (user, callback) => {
  const { username, email, phone, password, retailer } = user;
  const userID = GenerateId(retailer);

  db.query(
    "INSERT INTO users(userID,username,email,phone,passcode) VALUES(?,?,?,?,?)",
    [userID, username, email, phone, password],
    (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
      } else {
        console.log(results);
        callback(null, results);
      }
    }
  );
};

exports.userlogin = (user, callback) => {
  console.log(user);
  const { email, password } = user;

  db.query(
    "SELECT * FROM users WHERE email = ? AND passcode = ?",
    [email, password],
    (err, result) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        callback(null, result);
      }
    }
  );
};

exports.useraddproduct = (user, callback) => {
  const {
    category,
    prodid,
    prodname,
    quantity,
    price,
    description,
    prodimg,
    userid,
  } = user;

  db.query(
    "INSERT INTO products VALUES(?,?,?,?,?,?,?,?)",
    [userid, category, prodid, prodname, quantity, price, description, prodimg],
    (err, result) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        // res.status(200).send(result);
        console.log(result);
        callback(null, result);
      }
    }
  );
};

exports.usergetproducts = (callback) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) {
      console.error(error);
      callback(err);
    }
    if (result.length > 0) {
      console.log(result);
      callback(null, result);
    }
  });
};

exports.usersetcartdata = (user, callback) => {
  const userid = user.userID;
  const prodid = user.prodid;

  let prodTotalQuantity = 0;
};
