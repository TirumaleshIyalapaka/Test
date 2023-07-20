# Backend Code for Shopping_Cart
I have tried to organize the code using the MVC architecture.

## The following are a few aspets of the code. 
I have written the controllers inside the controllers.js file.  
I have written the routes inside the routes.js file.
***  
![Frontend Page](frontend-about-page.png)

### I have created components for the following pages:
- Header  
- SideBar  
- Login
- Signup
- AddProduct
- Cart
___
1. The header component has the MARVEL Logo along with the cart badge, login and singup buttons.
2. The sidebar contains routing for the About,shopping and add product pages.

---

## The following is the code for the routes.  
  
```JavaScript
const express = require("express");
const controllers = require("../contollers/contollers");

module.exports = function (app, router) {
  app.route("/signup").post(controllers.signup);

  app.route("/login").post(controllers.login);

  app.route("/addproduct").post(controllers.addproduct);

  app.route("/getproducts").get(controllers.getproducts);

  app.route("/getcartdata").get(controllers.getcartdata);

  app.route("/buycartitems").get(controllers.buycartitems);
};

// module.exports = router;

```
