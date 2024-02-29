var express = require("express");
var userHelper = require("../helper/userHelper");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const Razorpay = require("razorpay");
const { ObjectId } = require("mongodb"); // Make sure to import ObjectId from the MongoDB library

var instance = new Razorpay({
  key_id: "rzp_test_8NokNgt8cA3Hdv",
  key_secret: "xPzG53EXxT8PKr34qT7CTFm9",
});


var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};

router.get("/", verifySignedIn, function (req, res, next) {
  let user = req.session.user;
  res.render("users/signin", { admin: false, user, layout: "empty" });
});


router.get("/chat", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  let pu_id = req.query.pu_id;
  let user_id = req.query.user_id;
  let brokerId = req.query.brokerId;
  let usertype;
  let brokers = await userHelper.getbrokers(brokerId);

  if (user_id == user._id) {
    usertype = "sender"
  } else {
    usertype = "reciver"
  }

  res.render("users/chat", { admin: false, user, pu_id, user_id, brokerId, brokers, usertype, layout: "home" });
});

router.post("/chat/:usertype/:user_id/:brokerId", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  let brokerId = req.params.brokerId;
  let user_id = req.params.user_id;
  let usertype = req.params.usertype;
  let brokers = await userHelper.getbrokers(brokerId);
  console.log(brokers.pu_id, brokers)
  let obj = {
    userId: user_id,
    usertype: usertype,
    msg: req.body.msg
  }
  await userHelper.addChat(obj, brokerId).then(() => {
    res.redirect(`/chat?pu_id=${brokers.pu_id}&user_id=${user_id}&brokerId=${brokerId}`);
  })

});


///////ALL report/////////////////////                                         
router.get("/all-reports", verifySignedIn, function (req, res) {
  let user = req.session.user;
  userHelper.getAllreports().then((reports) => {
    res.render("users/all-reports", { admin: false, layout: "home", reports, user });
  });
});

///////ADD report/////////////////////                                         
// router.get("/add-report", verifySignedIn, function (req, res) {
//   let user = req.session.user;
//   res.render("users/add-report", { admin: false, layout: "home", user });
// });

// ///////ADD report/////////////////////                                         
// router.post("/add-report", function (req, res) {
//   adminHelper.addreport(req.body, (id) => {
//     let image = req.files.Image;
//     image.mv("./public/images/report-images/" + id + ".png", (err, done) => {
//       if (!err) {
//         res.redirect("/users/all-reports");
//       } else {
//         console.log(err);
//       }
//     });
//   });
// });

router.get("/add-report", verifySignedIn, function (req, res) {
  let user = req.session.user;
  res.render("users/add-report", { admin: false, layout: "", user });
});

///////ADD report/////////////////////                                         
router.post("/add-report", async function (req, res) {
  try {
    userHelper.addreport(req.body, async (id) => {
      // Handle file upload
      if (req.files && req.files.Image) {
        let image = req.files.Image;
        image.mv("./public/images/report-images/" + id + ".png", (err, done) => {
          if (err) {
            console.error("Error uploading image:", err);
            // Handle error, maybe redirect to an error page
            res.redirect("/error");
            return;
          }
          console.log("Image uploaded successfully");
        });
      }

      // Redirect with success query parameter
      res.redirect(`/single-broker/${req.body.brokerId}`);
    });
  } catch (error) {
    console.error(error);
    res.redirect("/error");
  }
});



///////EDIT report/////////////////////                                         
router.get("/edit-report/:id", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let reportId = req.params.id;
  let report = await adminHelper.getreportDetails(reportId);
  console.log(report);
  res.render("users/edit-report", { admin: false, layout: "home", report, user });
});

///////EDIT report/////////////////////                                         
router.post("/edit-report/:id", verifySignedIn, function (req, res) {
  let reportId = req.params.id;
  adminHelper.updatereport(reportId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/report-images/" + reportId + ".png");
      }
    }
    res.redirect("/users/all-reports");
  });
});

///////DELETE report/////////////////////                                         
router.get("/delete-report/:id", verifySignedIn, function (req, res) {
  let reportId = req.params.id;
  adminHelper.deletereport(reportId).then((response) => {
    fs.unlinkSync("./public/images/report-images/" + reportId + ".png");
    res.redirect("/users/all-reports");
  });
});

///////DELETE ALL report/////////////////////                                         
router.get("/delete-all-reports", verifySignedIn, function (req, res) {
  adminHelper.deleteAllreports().then(() => {
    res.redirect("/users/all-reports");
  });
});

///////ALL credential/////////////////////                                         
router.get("/all-credentials", verifySignedIn, function (req, res) {
  let user = req.session.user;
  userHelper.getAllcredentials().then((credentials) => {
    res.render("admin/credential/all-credentials", { admin: false, layout: "", credentials, user });
  });
});

///////ADD credential/////////////////////                                         
// router.get("/add-credential", verifySignedIn, function (req, res) {
//   let user = req.session.user;
//   res.render("users/add-credential", { admin: false, layout: "", user });
// });

///////ADD credential/////////////////////                                         
router.post("/add-credential", async function (req, res) {
  try {
    const brokerId = req.body.brokerId;
    let user_id = req.body.userId;
    await userHelper.addcredential(req.body).then((data) => {
      userHelper.adddealings("Credentials", brokerId, user_id, data._id, "Payment", data).then(() => {
        res.redirect(`/single-broker/${brokerId}?success=true`);
      })
    })
    // Redirect with success query parameter

  } catch (error) {
    console.error("*************errrrr:", error);
    res.redirect("/error");
  }
});









///////EDIT credential/////////////////////                                         
router.get("/edit-credential/:id", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let credentialId = req.params.id;
  let credential = await userHelper.getcredentialDetails(credentialId);
  console.log(credential);
  res.render("admin/credential/edit-credential", { admin: false, layout: "", credential, user });
});

///////EDIT credential/////////////////////                                         
router.post("/edit-credential/:id", verifySignedIn, function (req, res) {
  let credentialId = req.params.id;
  userHelper.updatecredential(credentialId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/credential-images/" + credentialId + ".png");
      }
    }
    res.redirect("/admin/credential/all-credentials");
  });
});

///////DELETE credential/////////////////////                                         
router.get("/delete-credential/:id", verifySignedIn, function (req, res) {
  let credentialId = req.params.id;
  userHelper.deletecredential(credentialId).then((response) => {
    fs.unlinkSync("./public/images/credential-images/" + credentialId + ".png");
    res.redirect("/admin/credential/all-credentials");
  });
});

///////DELETE ALL credential/////////////////////                                         
router.get("/delete-all-credentials", verifySignedIn, function (req, res) {
  userHelper.deleteAllcredentials().then(() => {
    res.redirect("/admin/credential/all-credentials");
  });
});

router.post("/add-payment", async function (req, res) {
  try {
    console.log(req.body)
    const brokerId = req.body.brokerId;
    const user_id = req.body.userId;
    await userHelper.addpayment(req.body).then((data) => {
      userHelper.adddealings("Payment", brokerId, user_id, data._id, "Credentials", data).then(() => {
        res.redirect(`/single-broker/${brokerId}?success=true`);
      })
    })
  } catch (error) {
    console.error(error);
    res.redirect("/error");
  }
});



router.get("/menu-main", verifySignedIn, function (req, res, next) {
  let user = req.session.user;
  res.render("users/menu-main", { admin: false, user, layout: "" });
});

router.get("/index", verifySignedIn, function (req, res, next) {
  user = req.session.user;
  brokers = userHelper.getAllbrokers();
  users = userHelper.getAllUsers();
  userHelper.getAllUsers().then((users) => {
    res.render("users/index", { admin: false, brokers, user, users });
  })
});


router.get("/all-brokers", verifySignedIn, function (req, res) {
  const userId = req.session.user._id; // Assuming user._id is the user identifier
  userHelper.getAllbrokers(userId).then((brokers) => {
    res.render("users/all-brokers", { admin: false, brokers, user: req.session.user, layout: "home" });
  });
});



router.get("/single-broker/:id", async (req, res, next) => {
  let id = req.params.id;
  let user = null;
  let credentials = null;
  let usertype;
  let transferdata;
  let transferStatus = false;

  if (req.session.user) {
    user = req.session.user;
    credentials = await userHelper.getAllcredentials(); // Assuming getAllcredentials is an asynchronous function
  }
  let broker = await userHelper
    .getSingleBrokers(id)
    .then((response) => {
      var broker = response[0];
      if (user._id == broker.userId) {
        usertype = "owner"
      } else {
        usertype = "pairedUser"
      }
      if (broker.dealings.length == 2) {
        let first = broker.dealings[0];
        let second = broker.dealings[1];
        if (first.against == "Payment" && second.against == "Credentials") {
          if (first.usertype == "owner" && usertype == "owner") {
            transferdata = second;
            transferStatus = true;
          } else if (second.usertype == "owner" && usertype == "owner") {
            transferdata = first;
            transferStatus = true;
          } else if (first.usertype == "pairedUser" && usertype == "pairedUser") {
            transferdata = second;
            transferStatus = true;
          }
          else {
            transferdata = first;
            transferStatus = true;
          }
        } else if (second.against == "Payment" && first.against == "Credentials") {
          if (first.usertype == "owner" && usertype == "owner") {
            transferdata = second;
            transferStatus = true;
          } else if (second.usertype == "owner" && usertype == "owner") {
            transferdata = first;
            transferStatus = true;
          } else if (first.usertype == "pairedUser" && usertype == "pairedUser") {
            transferdata = second;
            transferStatus = true;
          }
          else {
            transferdata = first;
            transferStatus = true;
          }
        }


      } else {
        transferStatus = false;
      }
      console.log(transferStatus, transferdata, "*************")
      // console.log("usertranferrrr", transferdata, usertype)
      res.render("users/single-broker", {
        admin: false,
        back: true,
        successMessage: req.query.success,
        broker,
        user,
        transferdata,
        transferStatus,
        credentials, // Pass credentials to the view
      });
    });
});


///////ADD broker/////////////////////                                         


router.get("/add-broker", verifySignedIn, function (req, res) {
  user = req.session.user;
  res.render("users/all-brokers", { admin: false, layout: "", user });
});

///////ADD broker/////////////////////                                         
router.post("/add-broker", verifySignedIn, function (req, res) {
  const userId = req.session.user._id; // Assuming user._id is the user identifier
  userHelper.addbroker(userId, req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/broker-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/all-brokers");
      } else {
        console.log(err);
      }
    });
  });
});


///////EDIT broker/////////////////////                                         
router.get("/edit-broker/:id", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let brokerId = req.params.id;
  let broker = await userHelper.getbrokerDetails(brokerId);
  console.log(broker);
  res.render("users/edit-broker", { admin: false, layout: "", broker, user });
});

///////EDIT broker/////////////////////                                         
router.post("/edit-broker/:id", verifySignedIn, function (req, res) {
  let brokerId = req.params.id;
  userHelper.updatebroker(brokerId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/broker-images/" + brokerId + ".png");
      }
    }
    res.redirect("/users/all-brokers");
  });
});

///////DELETE broker/////////////////////                                         
router.get("/delete-broker/:id", verifySignedIn, function (req, res) {
  let brokerId = req.params.id;
  userHelper.deletebroker(brokerId).then((response) => {
    fs.unlinkSync("./public/images/broker-images/" + brokerId + ".png");
    res.redirect("/all-brokers");
  });
});

///////DELETE ALL broker/////////////////////                                         
router.get("/delete-all-brokers", verifySignedIn, function (req, res) {
  userHelper.deleteAllbrokers().then(() => {
    res.redirect("/users/all-brokers");
  });
});





router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/index");
  } else {
    res.render("users/signup", { admin: false, layout: "empty" });
  }
});

router.post("/signup", async function (req, res) {
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
      res.redirect("/index");
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
      res.render("users/signup", { admin: false, layout: "empty", signUpErr: errors, formData: req.body });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    // Handle unexpected errors, log them, and render an appropriate error page
    res.render("error", { message: "An unexpected error occurred", error });
  }
});




router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/index");
  } else {
    res.render("users/signin", {
      admin: false,
      layout: "empty",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  userHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedIn = true;
      req.session.user = response.user;
      res.redirect("/index");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.user = null;
  res.redirect("/");
});

router.get("/cart", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let cartProducts = await userHelper.getCartProducts(userId);
  let total = null;
  if (cartCount != 0) {
    total = await userHelper.getTotalAmount(userId);
  }
  res.render("users/cart", {
    admin: false,
    user,
    cartCount,
    cartProducts,
    total,
  });
});

router.get("/add-to-cart/:id", function (req, res) {
  console.log("api call");
  let productId = req.params.id;
  let userId = req.session.user._id;
  userHelper.addToCart(productId, userId).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", function (req, res) {
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});

router.post("/remove-cart-product", (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let total = await userHelper.getTotalAmount(userId);
  res.render("users/place-order", { admin: false, user, cartCount, total });
});

router.post("/place-order", async (req, res) => {
  let user = req.session.user;
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  userHelper
    .placeOrder(req.body, products, totalPrice, user)
    .then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }
    });
});

router.post("/verify-payment", async (req, res) => {
  console.log(req.body);
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "Payment Failed" });
    });
});

router.get("/order-placed", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/order-placed", { admin: false, user, cartCount });
});

router.get("/orders", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let orders = await userHelper.getUserOrder(userId);
  res.render("users/orders", { admin: false, user, cartCount, orders });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelper.getCartCount(userId);
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("users/order-products", {
      admin: false,
      user,
      cartCount,
      products,
    });
  }
);

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  userHelper.cancelOrder(orderId).then(() => {
    res.redirect("/orders");
  });
});

router.post("/search", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  userHelper.searchProduct(req.body).then((response) => {
    res.render("users/search-result", { admin: false, user, cartCount, response });
  });
});

module.exports = router;
