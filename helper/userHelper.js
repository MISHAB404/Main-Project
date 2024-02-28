var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_8NokNgt8cA3Hdv",
  key_secret: "xPzG53EXxT8PKr34qT7CTFm9",
});

module.exports = {

  //////ADD report/////////////////////                                         
  addreport: (report, callback) => {
    console.log(report);
    db.get()
      .collection(collections.REPORT_COLLECTION)
      .insertOne(report)
      .then((data) => {
        console.log(data);
        callback(null, data);  // Invoke callback with success and data
      })
      .catch((error) => {
        console.error("Error in addreport:", error);
        callback(error, null);  // Invoke callback with error
      });
  },

  ///////GET ALL report/////////////////////                                            
  getAllreports: () => {
    return new Promise(async (resolve, reject) => {
      let reports = await db
        .get()
        .collection(collections.REPORT_COLLECTION)
        .find()
        .toArray();
      resolve(reports);
    });
  },

  ///////ADD report DETAILS/////////////////////                                            
  getreportDetails: (reportId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REPORT_COLLECTION)
        .findOne({
          _id: objectId(reportId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE report/////////////////////                                            
  deletereport: (reportId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REPORT_COLLECTION)
        .removeOne({
          _id: objectId(reportId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE report/////////////////////                                            
  updatereport: (reportId, reportDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REPORT_COLLECTION)
        .updateOne(
          {
            _id: objectId(reportId)
          },
          {
            $set: {
              Name: reportDetails.Name,
              Category: reportDetails.Category,
              Description: reportDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL report/////////////////////                                            
  deleteAllreports: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REPORT_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },


  ///////ADD credential/////////////////////                                         
  addcredential: (credential) => {
    console.log("i am in add_cred");
    return new Promise((resolve, reject) => {
    db.get()
      .collection(collections.CREDENTIAL_COLLECTION)
      .insertOne(credential)
      .then((data) => {
        resolve(data.ops[0]);
      });
    })
  },

  addpayment: (payment) => {
    return new Promise((resolve, reject) => {
    db.get()
      .collection(collections.PAYMENT_COLLECTION)
      .insertOne(payment)
      .then((data) => {
        resolve(data.ops[0]);
      });
    })
  },
  //userHelper.adddealings("Payment",brokerId,user_id,data._id,"Credentials",data).then(()=>{
  adddealings:(type,brokerId,user_id,typeDB_id,against,formdata)=>{
    console.log("ss",brokerId,"sdd")
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.BROKER_COLLECTION).find({ _id: objectId(brokerId) }).toArray();
      let obj={}
      obj.type=type;
      obj.typeDB_id=typeDB_id;
      console.log(data,"oener",formdata.userId ,"paird current",user_id)
      if(data[0].userId== formdata.userId ){
        obj.d_id=data[0].userId ;
        obj.usertype="owner"
      }else{
        obj.d_id=user_id;
        obj.usertype="pairedUser"
      }
      obj.against=against;
  
      if(formdata.category=="Credentials"){
        obj.username=formdata.username;
        obj.password=formdata.password;
        obj.access=formdata.access;
        obj.type=formdata.type[0];
        obj.category=formdata.category;
      }else if(formdata.category=="Payment"){
        obj.type=formdata.type;
        obj.amount=formdata.amount;
        obj.category=formdata.category;
      }
      let dealings =await db.get()
      .collection(collections.BROKER_COLLECTION).updateOne(
        { _id: objectId(brokerId) },
        {
          $push: {dealings: obj },
        }
      )
      .then((response) => {
        resolve(response);
      });
      
    });

  },

  addChat:(obj,brokerId)=>{
    return new Promise(async (resolve, reject) => {
      // let data = await db.get().collection(collections.BROKER_COLLECTION).find({ _id: objectId(brokerId) }).toArray();
      let dealings =await db.get()
      .collection(collections.BROKER_COLLECTION).updateOne(
        { _id: objectId(brokerId) },
        {
          $push: {chat: obj },
        }
      )
      .then((response) => {
        resolve(response);
      });
      
    });

  },

  getbrokers: (b_id) => {
    return new Promise(async (resolve, reject) => {
      let broker = await db
        .get()
        .collection(collections.BROKER_COLLECTION)
        .findOne({_id:objectId(b_id)})
      resolve(broker);
    });
  },


  ///////GET ALL credential/////////////////////                                            
  getAllcredentials: (brokerId) => {
    return new Promise(async (resolve, reject) => {
      let credentials = await db
        .get()
        .collection(collections.CREDENTIAL_COLLECTION)
        .find({ brokerId: objectId(brokerId) })
        .toArray();
      resolve(credentials);
    });
  },


  ///////ADD credential DETAILS/////////////////////                                            
  getcredentialDetails: (credentialId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CREDENTIAL_COLLECTION)
        .findOne({
          _id: objectId(credentialId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE credential/////////////////////                                            
  deletecredential: (credentialId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CREDENTIAL_COLLECTION)
        .removeOne({
          _id: objectId(credentialId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE credential/////////////////////                                            
  updatecredential: (credentialId, credentialDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CREDENTIAL_COLLECTION)
        .updateOne(
          {
            _id: objectId(credentialId)
          },
          {
            $set: {
              username: credentialDetails.username,
              password: credentialDetails.password,
              key: credentialDetails.key,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL credential/////////////////////                                            
  deleteAllcredentials: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CREDENTIAL_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  getSingleBrokers: (bro) => {
    return new Promise(async (resolve, reject) => {
      let brokers = await db
        .get()
        .collection(collections.BROKER_COLLECTION)
        .find({ _id: objectId(bro) })
        .toArray();
      resolve(brokers);
    });
  },

  ///////ADD broker/////////////////////                                         
  addbroker: (userId, broker, callback) => {
    console.log(broker);
    // Add userId to the broker data]
    let [name, id] = broker.pairedUser.split('|').map(item => item.trim());
    broker.userId = userId;
    broker.pairedUser=name;
    broker.pu_id=id;
    broker.status="accepted"
    broker.chats=[];
    broker.dealings=[];

    db.get()
      .collection(collections.BROKER_COLLECTION)
      .insertOne(broker)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },


  ///////GET ALL broker/////////////////////                                            
  getAllbrokers: (userId) => {
    return new Promise(async (resolve, reject) => {
      let brokers = await db
        .get()
        .collection(collections.BROKER_COLLECTION)
        .find({ $or: [{ userId: userId }, { pu_id: userId }] }) // Filter brokers based on userId
        .toArray();
      resolve(brokers);
    });
  },

  ///////ADD broker DETAILS/////////////////////                                            
  getbrokerDetails: (brokerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BROKER_COLLECTION)
        .findOne({
          _id: objectId(brokerId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE broker/////////////////////                                            
  deletebroker: (brokerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BROKER_COLLECTION)
        .removeOne({
          _id: objectId(brokerId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE broker/////////////////////                                            
  updatebroker: (brokerId, brokerDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BROKER_COLLECTION)
        .updateOne(
          {
            _id: objectId(brokerId)
          },
          {
            $set: {
              Name: brokerDetails.Name,
              Category: brokerDetails.Category,
              Price: brokerDetails.Price,
              Description: brokerDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL broker/////////////////////                                            
  deleteAllbrokers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BROKER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },


  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      // Check if the email already exists in the database
      const existingUser = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ Email: userData.Email });

      if (existingUser) {
        // If the email is already registered, reject with a custom error message
        reject("This email is already registered");
        return;
      }

      // If the email is not registered, proceed with user registration
      userData.Password = await bcrypt.hash(userData.Password, 10);
      userData.brokers=[];
      db.get()
        .collection(collections.USERS_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.ops[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },


  doSignin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },

  addToCart: (productId, userId) => {
    console.log(userId);
    let productObject = {
      item: objectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let productExist = userCart.products.findIndex(
          (products) => products.item == productId
        );
        console.log(productExist);
        if (productExist != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: productObject },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObject = {
          user: objectId(userId),
          products: [productObject],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObject)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      // console.log(cartItems);
      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        var sumQuantity = 0;
        for (let i = 0; i < cart.products.length; i++) {
          sumQuantity += cart.products[i].quantity;
        }
        count = sumQuantity;
      }
      resolve(count);
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then(() => {
          resolve({ status: true });
        });
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
            },
          },
        ])
        .toArray();
      console.log(total[0].total);
      resolve(total[0].total);
    });
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },

  placeOrder: (order, products, total, user) => {
    return new Promise(async (resolve, reject) => {
      console.log(order, products, total);
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let orderObject = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: objectId(order.userId),
        user: user,
        paymentMethod: order["payment-method"],
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .insertOne({ orderObject })
        .then((response) => {
          db.get()
            .collection(collections.CART_COLLECTION)
            .removeOne({ user: objectId(order.userId) });
          resolve(response.ops[0]._id);
        });
    });
  },

  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ "orderObject.userId": objectId(userId) })
        .toArray();
      // console.log(orders);
      resolve(orders);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$orderObject.products",
          },
          {
            $project: {
              item: "$orderObject.products.item",
              quantity: "$orderObject.products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(products);
    });
  },

  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        console.log("New Order : ", order);
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "xPzG53EXxT8PKr34qT7CTFm9");

      hmac.update(
        details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },

  searchProduct: (details) => {
    console.log(details);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .createIndex({ Name: "text" }).then(async () => {
          let result = await db
            .get()
            .collection(collections.PRODUCTS_COLLECTION)
            .find({
              $text: {
                $search: details.search,
              },
            })
            .toArray();
          resolve(result);
        })

    });
  },
};
