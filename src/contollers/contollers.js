const util = require("../util/util");
// const mysql = require("mysql");

// const cors = require("cors");
// const bodyparser = require("body-parser");

// const db = mysql.createConnection({
//   user: "root",
//   host: "localhost",
//   password: "password",
//   database: "shopping_cart",
// });

exports.signup = (req, res) => {
  console.log(req.body);
  const user = req.body;
  util.usersignup(user, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json("An error Occured!");
    } else {
      console.log(result);
      res.status(200).json("Data inserted successfully.");
    }
  });
};

exports.login = (req, res) => {
  console.log(req.body);
  const user = req.body;
  util.userlogin(user, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send({ err: error });
    }
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(401).send({ message: "Invalid Email ID or Password!" });
    }
  });
};

exports.addproduct = (req, res) => {
  console.log(req.body);
  const user = req.body;
  util.useraddproduct(user, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send({ err: error });
    } else {
      console.log(result);
      res.status(200).send(result);
    }
  });
};

exports.getproducts = (req, res) => {
  util.usergetproducts((error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send({ err: error });
    }
    if (result.length > 0) {
      console.log(result);
      res.status(200).send(result);
    }
  });
};

exports.setcartdata = (req, res) => {
  console.log(req.body);
  const userid = req.body.userID;
  const prodid = req.body.prodid;
  // const quantity = req.body.qunatity;
  console.log(userid, prodid);
  let prodTotalQuantity = 0;

  db.query(
    "SELECT quantity FROM products where prodid = ?",
    [prodid],
    (err, result) => {
      if (err) {
        res.send({ err: err });
        console.log(err);
      } else {
        // console.log("Getting Product Quantity from products table");
        // console.log(result[0].quantity);
        prodTotalQuantity = result[0].quantity;
        // console.log(prodTotalQuantity,"totalprodquantity");
      }
    }
  );

  db.query(
    "SELECT * FROM cart WHERE userID = ? AND prodid = ?",
    [userid, prodid],
    (err, result) => {
      if (err) {
        res.send({ err: err });
        // console.log(err);
      } else {
        if (result.length == 0) {
          if (prodTotalQuantity != 0) {
            // console.log("Inserting data into cart when length = 0");
            db.query(
              "INSERT INTO cart values(?,?,?)",
              [userid, prodid, 1],
              (err, result) => {
                if (err) {
                  console.error(err);
                } else {
                  db.query(
                    "SELECT * FROM cart WHERE userID=?",
                    [userid],
                    (err, result) => {
                      if (err) {
                        console.error(err);
                      } else {
                        console.log(result, "This is my updated cart data");
                        res.status(200).send(result);
                      }
                    }
                  );
                  // console.log(result);
                  // console.log("Data Inserted Cart");
                }
              }
            );
          } else if (prodTotalQuantity - result[0].quantity == 0) {
            res.send(0);
            // console.log("Items out of stock!");
          }
        } else {
          // console.log("When product is already in cart and trying to update quantity");
          if (prodTotalQuantity - result[0].quantity != 0) {
            let cartQuantity = result[0].quantity;
            // console.log(result[0].quantity,"when length is > 0 ");
            db.query(
              "UPDATE cart SET quantity = ? WHERE userID =? AND prodid = ?",
              [cartQuantity + 1, userid, prodid],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(result);
                }
              }
            );
            // console.log("Quantity Updated Check in DataBase");
          }
        }
        // console.log(result);
        // console.log(result.length);
      }
    }
  );
};

exports.getcartdata = async (req, res) => {
  const { userID } = req.query;
  console.log(req.query);
  console.log(userID, " is my user id");

  let cartData;
  let products;
  let cartValue = 0;
  try {
    await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM cart WHERE userID = ?",
        [userID],
        async (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          if (result.length > 0) {
            cartData = result;
          }
          resolve();
        }
      );
    });

    console.log(
      cartData,
      " is my cart data %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
    );

    await new Promise((resolve, reject) => {
      db.query("SELECt * FROM products", (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        if (result.length !== 0) {
          products = result;
        }
        resolve();
      });
    });

    console.log(products, " is all the products data");

    // Process the cartData and products as needed

    // Return the response
    const purchasedItems = cartData.map((item) => {
      console.log(item, "is cart item");
      const matchedProduct = products.find(
        (product) => item.prodid === product.prodid
      );
      if (matchedProduct) {
        cartValue += matchedProduct.price * item.quantity;
        return { ...matchedProduct, cartItemQty: item.quantity };
      }
      // return null; // Return null if no match is found
    });
    console.log(cartValue);

    console.log(purchasedItems, "are the items purchased");

    res.send([purchasedItems, cartValue]);
    //   res.status(200).json({ cartData, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  // const purchasedItems = carData && carData.map((item)=>{

  //     console.log(item, "is my item");

  // });

  // const purchasedItems = cartData.map((item) => {
  //      console.log(item, "is cart item");
  //        const items = products.find((product) => {
  //            if (item.prodid == product.prodid) {
  //                // console.log("Item matched");
  //                // console.log({ ...product, cartItemQty: item.quantity }, " each mathched object");
  //                let obj = { ...product, cartItemQty: item.quantity };
  //                // console.log(obj, " is my obje");
  //                return obj;
  //            }
  //        })
  //        console.log(items, "are the items purchased");
  //        return items;
  // });

  // purchasedItems;
  // res.json({ message: "Data received successfully" });
};

exports.buycartitems = async (req, res) => {
  // const {userID} = req.query;
  // console.log(userID);

  // let cartData;
  // let products;

  // try{

  //     await new Promise((resolve, reject) => {
  //         db.query("SELECT * FROM cart WHERE userID = ?", [userID], async (err, result) => {
  //           if (err) {
  //             console.log(err);
  //             return reject(err);
  //           }
  //           if (result.length > 0) {
  //             cartData = result;
  //           }
  //           resolve();
  //         });
  //       });

  //       console.log(cartData,"CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC");

  //       await new Promise((resolve, reject) => {
  //         db.query("SELECt * FROM products", (err, result) => {
  //           if (err) {
  //             console.log(err);
  //             return reject(err);
  //           }
  //           if (result.length !== 0) {
  //             products = result;
  //           }
  //           resolve();
  //         });
  //       });

  //       const purchasedItems = cartData.map((item) => {
  //         console.log(item, "is cart item");
  //         const matchedProduct = products.find((product) => {
  //         if (item.prodid === product.prodid) {
  //             db.query("UPDATE FROM products set quantity = ? where prodid=?",[product.quantity-item.quantity,item.prodid]
  //             ,(err,result)=>{
  //                 if(err){
  //                     console.error(err);
  //                 }
  //                 if(result.length>0){
  //                     db.query("DELETE FROM cart WHERE userID=?",[userID],
  //                     (err,result)=>{
  //                         if(err){
  //                             console.error(err);
  //                         }else{
  //                             res.send(result);
  //                         }
  //                     })
  //                 }
  //             })
  //           return true;
  //         } else {
  //           return false;
  //         }
  //       });
  //       console.log(matchedProduct);

  //        // return null; // Return null if no match is found
  //      });

  //      console.log(purchasedItems,"UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUPDATE");

  // }catch(err){
  //     res.status(500).json({ error: err.message });
  // }

  //code from above get request

  const { userID } = req.query;
  console.log(req);
  console.log(userID, " is my user id");

  let cartData;
  let products;
  let cartValue = 0;
  try {
    await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM cart WHERE userID = ?",
        [userID],
        async (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          if (result.length > 0) {
            cartData = result;
          }
          resolve();
        }
      );
    });

    console.log(
      cartData,
      " is my cart data ******%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
    );

    await new Promise((resolve, reject) => {
      db.query("SELECt * FROM products", (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        if (result.length !== 0) {
          products = result;
        }
        resolve();
      });
    });

    console.log(products, " is all the products data");

    // Process the cartData and products as needed

    // Return the response
    const purchasedItems = cartData.map((item) => {
      console.log(item, "is cart item");
      const matchedProduct = products.find((product) => {
        if (item.prodid === product.prodid) {
          if (product.quantity - item.quantity > 0) {
            db.query(
              "UPDATE products set quantity = ? where prodid=?",
              [product.quantity - item.quantity, item.prodid],
              (err, result) => {
                if (err) {
                  console.error(err);
                }
                if (result) {
                  db.query(
                    "DELETE FROM cart WHERE userID=?",
                    [userID],
                    (err, result) => {
                      if (err) {
                        console.error(err);
                      } else {
                        res.status(200);
                      }
                    }
                  );
                }
              }
            );
          } else {
            db.query(
              "DELETE FROM products WHERE prodid=?",
              [item.prodid],
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                if (result) {
                  console.log(
                    result,
                    "is the result after updating and deleting"
                  );
                  db.query(
                    "DELETE FROM cart WHERE userID=?",
                    [userID],
                    (err, result) => {
                      if (err) {
                        console.error(err);
                      } else {
                        res.status(200);
                      }
                    }
                  );
                }
              }
            );
          }
          return product;
        } else {
          return false;
        }
      });
      //    if (matchedProduct) {
      //     cartValue += matchedProduct.price*item.quantity;
      //      return { ...matchedProduct, cartItemQty: item.quantity };
      //    }
      // return null; // Return null if no match is found
    });
    //  console.log(cartValue);

    console.log(purchasedItems, "UPPPPPPPPPDDDDDDAAAAATTTEEEEDD");

    res.send(purchasedItems);
    //   res.status(200).json({ cartData, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  // let cartData;
  // let productData;

  // db.query("SELECT * FROM cart WHERE userID = ?",
  // [userID],
  // (err,result)=>{
  //     if(err){
  //         res.send({err:err});
  //         // console.log(err);
  //     }if(result.length>0){
  //         res.status(200).send(result);
  //         // console.log(result," is my cart data");
  //         cartData = result;
  //     }
  // });

  // db.query("SELECt * FROM products",(err,result)=>{
  //     if(err){
  //         res.send({err:err});
  //         // console.log(err);
  //     }
  //     if(result.length  != 0){
  //         // console.log(result, " is  all the products data");
  //         productData = result;
  //     }
  // });
};
