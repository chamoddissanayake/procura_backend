var express = require('express');
var router = express.Router();
const dbCon = require("../utils/db_Connection");
var Requisition = require('../models/Requisition');
const params = require('../params');
var ObjectId = require('mongodb').ObjectID;

var Item = require('../models/Item');
var Supplier = require('../models/Supplier');
var Site = require('../models/Location');

router = express.Router();

/* GET ALL Requisitions */
router.get('/all', function (req, res, next) {

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Requisitions")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.send(result);
        db.close();
      });
  });



});


router.get('/adminAll', async function (req, res, next) {
  console.log("hi");
  let requisition = [];
  try {
    requisition = await Requisition
      .find()
      .populate(
        [
          {
            path: 'itemId', model: Item,
            select: ['itemName', 'photoURL11', 'photoURL21'],
          },
          {
            path: 'supplierId', model: Supplier,
            select: ['name', 'location'],
          },
          {
            path: 'siteId', model: Site,
            select: ['location'],
          },
        ]
      )

  } catch (e) {
    console.log("ERROR:", e);
    res.status(200).json({ 'success': false, 'error': e.message })
  } finally {
    if (requisition) {
      res.status(200).json({ 'success': true, requisitions: requisition })
    }
  }
});


router.get('/reqisitionDeatils', async function (req, res, next) {
  let requisitionPaid;
  let requisitionPending;
  let requisitionApproved;
  let requisitionRejected;
  let requisitionDetails = [];
  try {
    requisitionPaid = await Requisition
      .find({ status: "PAID" }).count()

    requisitionPending = await Requisition
      .find({ status: "APPROVAL_PENDING" }).count()

    requisitionApproved = await Requisition
      .find({ status: "APPROVED" }).count()

    requisitionRejected = await Requisition
      .find({ status: "REJECTED" }).count()

    requisitionDetails = {
      requisitionPaid: requisitionPaid, requisitionPending: requisitionPending, requisitionApproved: requisitionApproved,
      requisitionRejected: requisitionRejected
    }

  } catch (e) {
    console.log("ERROR:", e);
    res.status(200).json({ 'success': false, 'error': e.message })
  } finally {
    if (requisition) {
      res.status(200).json({ 'success': true, requisitionDetails: requisitionDetails })
    }
  }
});

/* GET Requisitions BY Type */
router.get('/:type', function (req, res, next) {
  console.log("----");
  console.log(req.params.type);
  var stringArr = req.url.split('type=');
  var type = stringArr[1];

  // APPROVAL_PENDING , APPROVED , REJECTED , IN_PROCESS , ORDER_PLACED , DELIVERED , PARTIALLY_DELIVERED
  if (type == 'APPROVAL_PENDING' || type == 'APPROVED' || type == 'REJECTED' || type == 'IN_PROCESS' || type == 'ORDER_PLACED'
    || type == 'DELIVERED' || type == 'PARTIALLY_DELIVERED') {

    var MongoClient = require("mongodb").MongoClient;
    var url = dbCon.mongoURIConnString;

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("ProcurementDB");
      dbo
        .collection("Requisitions")
        .find({ status: type })
        .toArray(function (err, result) {
          if (err) throw err;
          // console.log(result);
          res.send(result);
          db.close();
        });
    });

  }

});

// Get Requisition by requisionId
router.get('/getById/:reqId', function (req, res, next) {
  console.log("----");
  console.log(req.params.type);
  var stringArr = req.url.split('reqId=');
  var reqId = stringArr[1];

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Requisitions")
      .find(ObjectId(reqId))
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.send(result);
        db.close();
      });
  });
});




/* GET SINGLE Requisition BY ID */
router.get('/:id', function (req, res, next) {
  Requisition.findById(req.params.id, function (err, requisition) {
    if (err) return next(err);
    res.json(requisition);
  });
});

/* POST - Register a Requisition */
router.post('/register', function (req, res, next) {

  console.log("444444433333")
  console.log(req.body);

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");

    // current timestamp in milliseconds
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    var today = date + "/" + month + "/" + year;

    var requisitionObj = {
      siteManagerUsername: req.body.loggedInUser,
      itemId: req.body.itemObjId,
      supplierId: req.body.supplierId,
      quantity: req.body.orderCount,
      requiredDate: req.body.selectedNeedDate,
      siteId: req.body.selectedSite,
      totalPrice: req.body.total,
      comment: req.body.comment,
      priority: req.body.priority,
      status: req.body.status,
      requisitionDate: today,
      approvedDate: "",
      approvedBy: ""
    };

    dbo.collection("Requisitions").insertOne(requisitionObj, function (err, res1) {
      if (err) throw err;
      console.log("1 requisition inserted");
      // console.log(res1);

      //if the type order placed without approval
      //add to orders collection
      //send mail

      if (req.body.status == 'ORDER_PLACED') {

        console.log("Placed type order");
        console.log(res1.ops[0]._id);
        console.log(req.body.supplierId);
        console.log(req.body.orderCount);

        var supplierMail = "";
        dbo.collection("Supplier").findOne({ "_id": ObjectId(req.body.supplierId) }, function (err, result) {
          if (err) throw err;
          console.log(result.supplierMail);
          //#
          var supplierName = result.name;
          //#
          supplierMail = result.supplierMail;

          var str = res1.ops[0]._id + '';
          var split = str.split('"');

          var orderObj = {
            requisitionId: split[0],
            status: 'ORDER_PLACED',
            orderedCount: req.body.orderCount,
            receivedCount: 0,
            signature: "",
            receivedDate: "",
            totalPrice: req.body.total,
          payStatus:false,
                        };

          dbo.collection("Orders").insertOne(orderObj, function (err, res1) {
            if (err) throw err;
            console.log("1 order inserted");

            dbo.collection("Items").findOne({ "_id": ObjectId(req.body.itemObjId) }, function (err, res2) {
              if (err) throw err;
              var itemName = res2.itemName;

              console.log("#########");
              console.log(itemName);
              console.log(supplierName);

              var orderCount = req.body.orderCount;
              var selectedNeedDate = req.body.selectedNeedDate;
              var total = req.body.total;
              var comment = req.body.comment;

              var priorityStr = "";
              if (req.body.priority == 1) {
                priorityStr = "Low";
              } else if (req.body.priority == 2) {
                priorityStr = "Medium";
              } else if (req.body.priority == 3) {
                priorityStr = "High";
              }

              var priority = req.body.priority;

              console.log(req.body.orderCount);
              console.log(req.body.selectedNeedDate);
              console.log(req.body.total);
              console.log(req.body.comment);
              console.log(req.body.priority);
              console.log("#########");



              //send mail
              var nodemailer = require('nodemailer');
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'procuracsseproject@gmail.com',
                  pass: 'csseproject'
                }
              });

              var mailOptions = {
                from: 'procuracsseproject@gmail.com',
                to: supplierMail,
                subject: 'Order request',
                html: '<p>Hi </p>' + supplierName + ',<br/>' + '<p>We are glad to inform you that we need to purchse the following items from your company</p><br/>' +
                  '<p><b>Item Name:</b>' + itemName + '</p>' +
                  '<p><b>Item Quantity:</b>' + orderCount + '</p>' +
                  '<p><b>Need On or before:</b>' + selectedNeedDate + '</p>' +
                  '<p><b>Expected Total Price:</b>' + total + '</p>' +
                  '<p><b>Item Quantity:</b>' + orderCount + '</p>' +
                  '<p><b>Priority:</b>'+priorityStr+'</p>' +
                  '<p><b>Comment:</b>'+comment+'</p>'

              };

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              //send mail end
              // console.log(res1);
              res.send(res1);
              db.close();
            });

            // console.log(res1);
            // res.send(res1);
            // db.close();
          });
          // res.send(result);
          // db.close();
          //Insert order to orders collection - end
        });

        // mail
      } else {
        res.send(res1);
        db.close();
      }

    });
  });

});


/* POST - Update a Requisition */
router.post('/placeApprovedOrder', function (req, res, next) {

  console.log(req.body);

  // req.body.reqId

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    var myquery = { "_id": ObjectId(req.body.reqId) };
    var newvalues = { $set: { status: "ORDER_PLACED" } };
    dbo.collection("Requisitions").updateOne(myquery, newvalues, function (err, resx) {
      if (err) throw err;
      console.log("1 document updated");

      console.log("&&");
      console.log(req.body.reqId);

      dbo.collection("Requisitions").findOne({ "_id": ObjectId(req.body.reqId) }, function (err, result1) {
        if (err) throw err;

        console.log("*1*");
        console.log(result1);
        console.log("-1-");


        dbo.collection("Items").findOne({ "_id": ObjectId(result1.itemId) }, function (err, resu) {
          if (err) throw err;

          var itemName = resu.itemName;


                        dbo.collection("Sites").findOne({"_id":ObjectId(result1.siteId) }, function(err2, result2) {
                            if (err2){
                                console.log(err2);
                                throw err2;
                            } 
                            console.log("*2*");
                            console.log(result2);
                            console.log("-2-");
                        dbo.collection("Supplier").findOne({"_id": ObjectId(result1.supplierId)}, function(err, result3) {
                                if (err) throw err;
                                console.log("*3*");
                                console.log(result3);
                                console.log("*3*");
                                var orderObj = {
                                    requisitionId: req.body.reqId,
                                    status :'ORDER_PLACED',
                                    orderedCount:result1.quantity,
                                    receivedCount:0,
                                    signature:"",
                                    receivedDate:"",
                                    totalPrice: result1.totalPrice,
                                    payStatus:false,
                                };
                    
                                dbo.collection("Orders").insertOne(orderObj, function(err, res1) {
                                    if (err) throw err;
                                    console.log("1 order inserted");

                // mail start
                // console.log(itemName);
                // console.log(supplierName);

                var orderCount = result1.quantity; //
                var selectedNeedDate = result1.requiredDate;  //
                var total = result1.totalPrice;  //
                var comment = result1.comment; //
                var supplierName = result3.name; //

                var priorityStr = "";
                if (result1.priority == '1') {
                  priorityStr = "Low";
                } else if (result1.priority == '2') {
                  priorityStr = "Medium";
                } else if (result1.priority == '3') {
                  priorityStr = "High";
                }
                console.log("#########");
                //send mail
                var nodemailer = require('nodemailer');
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'procuracsseproject@gmail.com',
                    pass: 'csseproject'
                  }
                });

                var mailOptions = {
                  from: 'procuracsseproject@gmail.com',
                  to: 'dissanayakechamod@gmail.com',
                  subject: 'Order request',
                  html: '<p>Hi ' + supplierName + ',</p>' + '<p>We are glad to inform you that we need to purchse the following items from your company</p><br/>' +
                    '<p><b>Item Name:</b>' + itemName + '</p>'+
                                    '<p <b>Item Quantity:</b>' + orderCount + '</p>' +
                    '<p><b>Need On or before:</b>' + selectedNeedDate + '</p>' +
                    '<p><b>Expected Total Price:</b>' + total + '</p>' +
                    '<p><b>Item Quantity:</b>' + orderCount + '</p>' +
                    '<p><b>Priority:</b>' + priorityStr + '</p>' +
                    '<p><b>Comment:</b>' + comment + '</p>'

                };
                // console.log("ffff");
//                                 console.log('<p>Hi </p>'+supplierName+',<br/>'+'<p>We are glad to inform you that we need to purchse the following items from your company</p><br/>'+
//                                 '<p>Item Name:</p>'+itemName+'<br/>'+
//                                 '<p>Item Quantity:</p>'+orderCount+'<br/>'+
//                                 '<p>Need On or before:</p>'+selectedNeedDate+'<br/>'+
//                                 '<p>Expected Total Price:</p>'+total+'<br/>'+
//                                 '<p>Item Quantity:</p>'+orderCount+'<br/>'+
//                                 '<p>Priority:</p>'+priorityStr+'<br/>'+
//                                 '<p>Comment:</p>'+comment+'<br/>');

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                //send mail end
                // console.log(res1);
                res.send(result1);
                db.close();

              });

            });


          });




        });

      });

      // #

    });

  });



});


router.post('/placeRejectOrder', function (req, res, next) {

  console.log(req.body);

  // req.body.reqId

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    var myquery = { "_id": ObjectId(req.body.reqId) };
    var newvalues = { $set: { status: "REJECTED" } };
    dbo.collection("Requisitions").updateOne(myquery, newvalues)


  });

});



/* UPDATE Requisition */
router.put('/:id', function (req, res, next) {

  //   Requisition.findByIdAndUpdate(req.params.id, req.body, function (err, requisition) {
  //         if (err) return next(err);
  //         res.json(requisition);
  //     });
  res.send(req.body);
});

/* DELETE Requisition */
router.delete('/:id', function (req, res, next) {
  console.log(req.params.id);

  var stringArr = req.url.split('id=');
  var reqId = stringArr[1];

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    var myquery = { _id: reqId };
    dbo.collection("Requisitions").deleteOne({ "_id": ObjectId(reqId) }, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      res.send("true");
      db.close();
    });
  });

});

router.get('/daily/:status', function (req, res, next) {
  Requisition.aggregate([
    {
      $match: { status: req.params.status }
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updated"
            }
          }
        },
        count: {
          $sum: 1
        }
      }
    },
    { $sort: { _id: 1 } }
  ], function (err, siteManagers) {
    if (err) return next(err);
    res.json(siteManagers);
  });
});


//Provide requisition id and get order object (if exists)

/* GET SINGLE Requisition BY ID */
router.get('/orderobjByReqId/:id', function (req, res, next) {

  var stringArr = req.url.split('id=');
  var reqId = stringArr[1];

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo.collection("Orders").findOne({ requisitionId: reqId }, function (err, result) {
      if (err) throw err;
      // console.log(result.name);
      res.send(result);
      db.close();
    });
  });




});



module.exports = router;