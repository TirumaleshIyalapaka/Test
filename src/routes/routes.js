const express = require("express");
const controllers = require("../contollers/contollers");

// const router = express.Router();

// router.post("/signup", controllers.signup);

// router.post("/login", controllers.login);

// router.post("/addproduct", controllers.addproduct);

// router.get("/getproducts", controllers.getproducts);

// router.post("/setcartdata", controllers.setcartdata);

// router.get("/getcartdata", controllers.getcartdata);

// router.get("/buycartitems", controllers.buycartitems);

module.exports = function (app, router) {
  //registeration api using contoller
  app.route("/signup").post(controllers.signup);

  //login api
  app.route("/login").post(controllers.login);

  //addproduct api to add the product
  app.route("/addproduct").post(controllers.addproduct);

  //getprducts api
  app.route("/getproducts").get(controllers.getproducts);

  //getcartdata api
  app.route("/getcartdata").get(controllers.getcartdata);

  //buycartitems api
  app.route("/buycartitems").get(controllers.buycartitems);
};

// module.exports = router;
