var express = require("express");
const { response } = require("../app");
var router = express.Router();
var Item = require("../models/Item");
var ObjectId = require('mongodb').ObjectID;
const dbCon = require("../utils/db_Connection");


/* GET ALL Items */
router.get("/", function (req, res, next) {

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("ProcurementDB");
      dbo
        .collection("Items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          // console.log(result);
          res.send(result);
          db.close();
        });
    });


});

/* GET all critical Items */
router.get("/critical", function (req, res, next) {
  //
  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  var limitPrice = 0;
  var criticalPercentage = 0;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Settings")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        limitPrice = result[0].limitPrice;
        criticalPercentage = result[0].criticalPercentage;

        dbo
          .collection("Items")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            console.log(result);

            var tempCriticalArray = [];
            result.forEach(function (element) {
              if (
                (element.availableQty / element.maxQty) * 100 <=
                criticalPercentage
              ) {
                //add to critical array
                tempCriticalArray.push(element);
              }
            });

            res.send(tempCriticalArray);
            db.close();
          });
      });
  });
});

/* GET all normal Items */
router.get("/normal", function (req, res, next) {
  //
  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  var limitPrice = 0;
  var criticalPercentage = 0;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Settings")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        limitPrice = result[0].limitPrice;
        criticalPercentage = result[0].criticalPercentage;

        dbo
          .collection("Items")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            console.log(result);

            var tempNormalArray = [];
            result.forEach(function (element) {
              if (
                (element.availableQty / element.maxQty) * 100 >
                criticalPercentage
              ) {
                //add to critical array
                tempNormalArray.push(element);
              }
            });

            res.send(tempNormalArray);
            db.close();
          });
      });
  });
});


/* GET SINGLE Item BY ID */
router.get("/:id", function (req, res, next) {
  console.log("-----");
  console.log(req.params.id);

  var stringArr = req.url.split('id=');
   var itemObjId  = stringArr[1]; 

   var MongoClient = require("mongodb").MongoClient;
   var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Items")
      .find(ObjectId(itemObjId))
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.send(result);
        db.close();
      });
  });


});




/* POST - Register a Item */
router.post("/register", function (req, res, next) {
  Item.create(req.body, function (err, item) {
    if (err) return next(err);
    res.json(item);
  });
});

/* UPDATE Item */
router.put("/:id", function (req, res, next) {
  Item.findByIdAndUpdate(req.params.id, req.body, function (err, item) {
    if (err) return next(err);
    res.json(item);
  });
});

/* DELETE Item */
router.delete("/:id", function (req, res, next) {
  Item.findByIdAndRemove(req.params.id, req.body, function (err, item) {
    if (err) return next(err);
    res.json(item);
  });
});

module.exports = router;
