var express = require('express');
var router = express.Router();
var Supplier = require('../models/Supplier');
var ObjectId = require('mongodb').ObjectID;
const dbCon = require("../utils/db_Connection");


/* GET ALL Supplier */
router.get('/all', function(req, res, next) {
    Supplier.find(function (err, suppliers) {
        if (err) return next(err);
        res.json(suppliers);
    });
});
  
/* GET SINGLE Supplier BY ID */
router.get('/:id', function(req, res, next) {

    console.log(req.params.id);
    var stringArr = req.url.split('id=');
   var supplierObjId  = stringArr[1]; 

   var MongoClient = require("mongodb").MongoClient;
   var url = dbCon.mongoURIConnString;

   MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Supplier")
      .find(ObjectId(supplierObjId))
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.send(result);
        db.close();
      });
  });

});
  
/* POST - Register a Supplier */
router.post('/register', function(req, res, next) {
    Supplier.create(req.body, function (err, supplier) {
        if (err) return next(err);
        res.json(supplier);
    });
});
  
/* UPDATE Supplier */
router.put('/:id', function(req, res, next) {
    Supplier.findByIdAndUpdate(req.params.id, req.body, function (err, supplier) {
        if (err) return next(err);
        res.json(supplier);
    });
});
  
/* DELETE Supplier */
router.delete('/:id', function(req, res, next) {
    Supplier.findByIdAndRemove(req.params.id, req.body, function (err, supplier) {
        if (err) return next(err);
        res.json(supplier);
    });
});

module.exports = router;