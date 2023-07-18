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
  app.route("/signup").post(controllers.signup);

  app.route("/login").post(controllers.login);

  app.route("/addproduct").post(controllers.addproduct);

  app.route("/getproducts").get(controllers.getproducts);

  app.route("/getcartdata").get(controllers.getcartdata);

  app.route("/buycartitems").get(controllers.buycartitems);
};

// module.exports = router;
