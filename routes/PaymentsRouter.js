var express = require('express');
var router = express.Router();
var Payments = require('../models/Payments');
var ObjectId = require('mongodb').ObjectID;
const dbCon = require("../utils/db_Connection");


router.post("/paid", function (req, res1, next) {

    console.log("%%%%");
    console.log(req.body);
    console.log("%%%%");

    //update requistion by orderId and set status as PAID

//update orders by reqId and set status as PAID

//add payment

    var MongoClient = require("mongodb").MongoClient;
    var url = dbCon.mongoURIConnString;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("ProcurementDB");
        var myquery = { "_id": ObjectId(req.body.reqId) };
        var newvalues = { $set: {status: "PAID" } };
        dbo.collection("Requisitions").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 requisition updated");     
                         

          var myquery1 = { "_id": ObjectId(req.body.orderId) };
          var newvalues1 = { $set: {status: "PAID", payStatus:true } };
          dbo.collection("Orders").updateOne(myquery1, newvalues1, function(err, res) {
            if (err) throw err;
            console.log("1 order updated"); 
             
                var paidobj = { orderId: req.body.orderId, reqId: req.body.reqId , payStatus:true };
                dbo.collection("Payments").insertOne(paidobj, function(err, res) {
                  if (err) throw err;
                  console.log("1 paid inserted");
                  res1.send(true);
                  db.close();
                });
              
          });
                //
        });
      }); 

 
  });

  
  

/* GET Paid Payments */
router.get('/getPaidItems', function(req, res, next) {
  
    var MongoClient = require("mongodb").MongoClient;
    var url = dbCon.mongoURIConnString;
    var respCount = 0;
    var result = [];
  
    MongoClient.connect(url, function (err, db) {
     if (err) throw err;
     var dbo = db.db("ProcurementDB");
     dbo.collection("Payments").find({payStatus: true }).toArray(function (err, resultPayments) {
         if (err) throw err;
                            console.log("payment loaded");

        if(resultPayments.length == 0){
            res.send(true);
            db.close();
            }
        
        for(let i = 0;i < resultPayments.length;i++){
              //order loop start
              
              var paymentObj = {
                reqId: resultPayments[i].reqId,
                orderId : resultPayments[i].orderId,
              };
              result.push(paymentObj);
  
              dbo.collection("Requisitions").find(ObjectId(resultPayments[i].reqId)).toArray(function (err, resultReq) {
                //req query start
                if (err) throw err;
                result[i].orderDate = resultReq[0].requisitionDate
                result[i].price = resultReq[0].totalPrice,

                dbo.collection("Orders").find(ObjectId(resultPayments[i].orderId)).toArray(function (err, orderReq) {
                    //req query start
                    if (err) throw err;
                    result[i].receivedDate = orderReq[0].receivedDate
                    result[i].status = "Paid"
                  

                dbo.collection("Items").find(ObjectId(resultReq[0].itemId)).toArray(function (err, resultItem) {
                        if (err){
                          console.log("error loading item for id:"+resultReq[0].itemId,err)
                          throw err;
                        } 
   
                          var item = resultItem[0];
                          result[i].id= respCount+1;
            
                          result[i].itemName = item.itemName
                          result[i].itemPhoto = item.photoURL11
                          
                          if(respCount++ == resultPayments.length-1){
                            console.log("########");
                            console.log(result);
                            db.close();
                            res.send(result);
                          }
  
                      }); //item query end
                    });
              });//req query end
        }//order loop end
       });
   });
  








//end
});

  
/* GET SINGLE Payment BY ID */
router.get('/:id', function(req, res, next) {

//     console.log(req.params.id);
//     var stringArr = req.url.split('id=');
//    var locationId  = stringArr[1]; 

//    var MongoClient = require("mongodb").MongoClient;
//    var url = dbCon.mongoURIConnString;

//    MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("ProcurementDB");
//     dbo
//       .collection("Sites")
//       .find(ObjectId(locationId))
//       .toArray(function (err, result) {
//         if (err) throw err;
//         res.send(result);
//         db.close();
//       });
//   });

});
  



  


module.exports = router;