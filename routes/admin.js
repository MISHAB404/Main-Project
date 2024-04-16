var express = require("express");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let administator = req.session.admin;
  adminHelper.getAllComplaints().then((complaints) => {
    res.render("admin/home", { admin: true, layout: "admin", administator, complaints });
  });
});


router.get("/all-products", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/all-products", { admin: true, layout: "admin", products, administator });
  });
});

router.get("/all-brokers", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllbrokers().then((brokers) => {
    res.render("admin/all-brokers", { admin: true, layout: "admin", brokers, administator });
  });
});

router.get("/delete-broker/:id", verifySignedIn, function (req, res) {
  let brokerId = req.params.id;
  adminHelper.deletebroker(brokerId).then((response) => {
    fs.unlinkSync("./public/images/broker-images/" + brokerId + ".png");
    res.redirect("/admin/all-brokers");
  });
});

router.get("/signup", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signup", {
      admin: true, layout: "admin2",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", function (req, res) {
  adminHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/admin/signup");
    } else {
      req.session.signedInAdmin = true;
      req.session.admin = response;
      res.redirect("/admin");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signin", {
      admin: true, layout: "admin2",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  adminHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInAdmin = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/admin/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInAdmin = false;
  req.session.admin = null;
  res.redirect("/admin");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-product", { admin: true, layout: "admin", administator });
});

router.post("/add-product", function (req, res) {
  adminHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let productId = req.params.id;
  let product = await adminHelper.getProductDetails(productId);
  console.log(product);
  res.render("admin/edit-product", { admin: true, layout: "admin", product, administator });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  adminHelper.deleteAllProducts().then(() => {
    res.redirect("/admin/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/all-users", { admin: true, layout: "admin", administator, users });
  });
});

router.get("/all-complaints", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllComplaints().then((complaints) => {
    res.render("admin/all-complaints", { admin: true, layout: "admin", administator, complaints });
  });
});

router.post("/reply", function (req, res) {
  console.log("repppp", req.body)
  adminHelper.setReply(req.body).then((complaints) => {
    res.redirect("/admin/all-complaints");
  });
});





// router.get("/createuser", function (req, res) {
//   res.render("users/signup", { admin: false, layout: "empty" });

// });

router.post("/createuser", async function (req, res) {
  try {
    const errors = [];

    // Check if the password is at least 6 characters long
    if (req.body.Password.length < 6) {
      errors.push("Please enter at least a 6-character strong password");
    }

    try {
      const response = await userHelper.doSignup(req.body);
      req.session.signedIn = true;
      req.session.user = response;
      res.redirect("/admin/all-users");
    } catch (error) {
      console.error(error);

      // Check if the error is a MongoDB duplicate key error
      if (error && error.message && error.message.includes("duplicate key error")) {
        console.log("Email already exists error:", error.message);
        errors.push("Email already exists");
      } else {
        console.log("Other error:", error.message);
        errors.push("Email already exists");
      }
    }

    // Check if there are any errors to display
    if (errors.length > 0) {
      // Pass entered data and errors to the template
      res.render("/admin/all-users", { admin: false, layout: "empty", signUpErr: errors, formData: req.body });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    // Handle unexpected errors, log them, and render an appropriate error page
    res.render("error", { message: "An unexpected error occurred", error });
  }
});


router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  adminHelper.removeAllUsers().then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let orders = await adminHelper.getAllOrders();
  res.render("admin/all-orders", {
    admin: true, layout: "admin",
    administator,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let administator = req.session.admin;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("admin/order-products", {
      admin: true, layout: "admin",
      administator,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  adminHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  adminHelper.cancelOrder(orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  adminHelper.cancelAllOrders().then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.searchProduct(req.body).then((response) => {
    res.render("admin/search-result", { admin: true, layout: "admin", administator, response });
  });
});


module.exports = router;
