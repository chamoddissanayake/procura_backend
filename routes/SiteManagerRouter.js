var express = require("express");
var router = express.Router();
var SiteManagers = require("../models/SiteManager");
const dbCon = require("../utils/db_Connection");

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";

/* GET ALL SiteManagers */
router.get("/all", function (req, res, next) {
  console.log("sdfsdfsdfsdf");
  SiteManagers.find(function (err, siteManagers) {
    if (err) return next(err);
    res.json(siteManagers);
  });
});

/* GET SINGLE SiteManagers BY ID */
router.get("/:id", function (req, res, next) {
  SiteManagers.findById(req.params.id, function (err, siteManagers) {
    if (err) return next(err);
    res.json(siteManagers);
  });
});

/* POST - Register a SiteManager */
router.post("/register", function (req, res, next) {
  SiteManagers.create(req.body, function (err, siteManager) {
    if (err) return next(err);
    res.json(siteManager);
  });
});

/* UPDATE SiteManager */
router.put("/:id", function (req, res, next) {
  SiteManagers.findByIdAndUpdate(req.params.id, req.body, function (
    err,
    siteManager
  ) {
    if (err) return next(err);
    res.json(siteManager);
  });
});

/* DELETE SiteManager */
router.delete("/:id", function (req, res, next) {
  Cases.findByIdAndRemove(req.params.id, req.body, function (err, siteManager) {
    if (err) return next(err);
    res.json(siteManager);
  });
});

/* POST - Login a SiteManager */
router.post("/login", function (req, res, next) {
  console.log("------");
  console.log(req.body.username);
  console.log(req.body.password);
  console.log("------");

  var MongoClient = require("mongodb").MongoClient;
  // var url = "mongodb://localhost:27017/";
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("SiteManagers")
      .findOne(
        { username: req.body.username, password: req.body.password },
        function (err1, result) {
          if (err1) throw err1;
          // console.log(result);

          var currentLoggedInUserObj = new Object();

          console.log(result);

          if (result == null) {
            currentLoggedInUserObj.isFound = "false";
            res.send(currentLoggedInUserObj);
            db.close();
          } else {
            currentLoggedInUserObj._id = result._id;
            currentLoggedInUserObj.username = result.username;
            currentLoggedInUserObj.gender = result.gender;
            currentLoggedInUserObj.siteId = result.siteId;
            currentLoggedInUserObj.workingHours = result.workingHours;
            currentLoggedInUserObj.nightShift = result.nightShift;
            currentLoggedInUserObj.rank = result.rank;
            currentLoggedInUserObj.updated = result.updated;
            currentLoggedInUserObj.isFound = "true";

            console.log(currentLoggedInUserObj);

            res.send(currentLoggedInUserObj);
            db.close();
          }
        }
      );
  });
});

module.exports = router;
