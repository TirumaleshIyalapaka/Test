const express = require("express");
const controllers = require("../contollers/contollers");

const router = express.Router();

router.post("/signup", controllers.signup);

router.post("/login", controllers.login);

router.post("/addproduct", controllers.addproduct);

router.get("/getproducts", controllers.getproducts);

router.post("/setcartdata", controllers.setcartdata);

router.get("/getcartdata", controllers.getcartdata);

router.get("/buycartitems", controllers.buycartitems);

module.exports = router;
