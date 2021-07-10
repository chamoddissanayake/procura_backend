var express = require('express');
var router = express.Router();
var Location = require('../models/Location');
var ObjectId = require('mongodb').ObjectID;
const dbCon = require("../utils/db_Connection");


/* GET ALL location */
router.get('/all', function(req, res, next) {
  
    var MongoClient = require("mongodb").MongoClient;
    var url = dbCon.mongoURIConnString;
  
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("ProcurementDB");
        dbo
          .collection("Sites")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            // console.log(result);
            res.send(result);
            db.close();
          });
      });


});
  
/* GET SINGLE location BY ID */
router.get('/:id', function(req, res, next) {

    console.log(req.params.id);
    var stringArr = req.url.split('id=');
   var locationId  = stringArr[1]; 

   var MongoClient = require("mongodb").MongoClient;
   var url = dbCon.mongoURIConnString;

   MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Sites")
      .find(ObjectId(locationId))
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });


});
  


  


module.exports = router;