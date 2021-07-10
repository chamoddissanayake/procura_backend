var express = require("express");
var router = express.Router();
var Order = require("../models/Order");
var Requisition = require("../models/Requisition");
var Supplier = require("../models/Supplier");
var Site = require("../models/Location");
var Item = require("../models/Item");
const dbCon = require("../utils/db_Connection");
var ObjectId = require('mongodb').ObjectID;
var REQUISITION_STATUS = require("../params").REQUISITION_STATUS;
var PAY_STATUS = require("../params").PAY_STATUS;

/* GET ALL Orders */
router.get('/all', async function(req, res, next) {
  let orders = [];
  let counts = {
    ORDER_PLACED :0,
    PARTIALLY_DELIVERED:0,
    DELIVERED:0,
    PAID:0
  }
  try{
     orders = await Order
     .find()
     .populate([
       {
         path:'requisitionId', model: Requisition,
         select:['itemId', 'comment'],
         populate:[
           {
            path: "itemId", 
            model: Item,
            select:['itemName', 'photoURL11','photoURL21'],
            populate:{
              path: "supplierId", 
              model: Supplier,
              select:['name','location'],
            }
           }, 
           {
            path: "siteId", 
            model: Site,
            select:'location'
           }
         ], 
       }, 
      ]
      )

      orders.forEach((val,i)=>{
        console.log(val.status);
        switch(val.status){
          case REQUISITION_STATUS.ORDER_PLACED :
            counts.ORDER_PLACED ++
            break
          case REQUISITION_STATUS.PARTIALLY_DELIVERED :
            counts.PARTIALLY_DELIVERED ++
            break
          case REQUISITION_STATUS.DELIVERED :
            counts.DELIVERED ++
            break
          case PAY_STATUS.PAID :
            counts.PAID ++
            break
          default :
        }
      })
      console.log(counts);
    }catch(e){
      console.log("ERROR:",e);
      res.status(200).json({'success':false, 'error': e.message })
    }finally{
      if(orders){
        res.status(200).json({'success':true, orders:orders, counts :counts})
      }
    }
});
  
/* GET SINGLE Order BY ID */
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


/* order received */
router.post("/received", function (req, response, next) {
  
    console.log("666");
    console.log(req.body);

         // current timestamp in milliseconds
         let ts = Date.now();

         let date_ob = new Date(ts);
         let date = date_ob.getDate();
         let month = date_ob.getMonth() + 1;
         let year = date_ob.getFullYear();
     
         // prints date & time in YYYY-MM-DD format
         var today = date+"/"+month+"/"+year;


    var reqObj = {
        fullDelivery : req.body.fullDelivery,
        inputCount : req.body.inputCount,
        orderId : req.body.orderId,
        proof : req.body.proof,
        quantity : req.body.quantity,
        reqId: req.body.reqId,
        date:today,
        totalPrice: req.body.totalPrice,
    }

    //update status of requisition colection
    //update orders
    // ##################
    var MongoClient = require("mongodb").MongoClient;
    var url = dbCon.mongoURIConnString;

    if(reqObj.fullDelivery){
        //full delivery start
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("ProcurementDB");
            var myquery = { "_id": ObjectId(reqObj.reqId) };
            var newvalues = { $set: {status: "DELIVERED" } };
            dbo.collection("Requisitions").updateOne(myquery, newvalues, function(err, res) {
              if (err) throw err;
              console.log("1 requisition updated");     
                             

              var myquery1 = { "_id": ObjectId(reqObj.orderId) };
              var newvalues1 = { $set: {
                  status: "DELIVERED", 
                  orderedCount:reqObj.quantity,
                  receivedCount : reqObj.inputCount,
                  signature : reqObj.proof,
                  receivedDate: reqObj.date,
                  totalPrice: reqObj.totalPrice,
                  payStatus:false,
                } };
              dbo.collection("Orders").updateOne(myquery1, newvalues1, function(err, res) {
                if (err) throw err;
                console.log("1 order updated");     
                               
                response.send(true);
                db.close();
              });
                    // #
              db.close();
            });
          }); 
        //full delivery end
    }else {
        //partial delivery start
         //full delivery start
         MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("ProcurementDB");
            var myquery = { "_id": ObjectId(reqObj.reqId) };
            var newvalues = { $set: {status: "PARTIALLY_DELIVERED" } };
            dbo.collection("Requisitions").updateOne(myquery, newvalues, function(err, res) {
              if (err) throw err;
              console.log("1 requisition updated");     
                             

              var myquery1 = { "_id": ObjectId(reqObj.orderId) };
              var newvalues1 = { $set: {
                  status: "PARTIALLY_DELIVERED", 
                  orderedCount:reqObj.quantity,
                  receivedCount : reqObj.inputCount,
                  signature : reqObj.proof,
                  receivedDate: reqObj.date,
                  totalPrice: reqObj.totalPrice,
                  payStatus:false,
                } };
              dbo.collection("Orders").updateOne(myquery1, newvalues1, function(err, res) {
                if (err) throw err;
                console.log("1 order updated");     
                               
                response.send(true);
                db.close();
              });
                    // #
              db.close();
            });
          }); 
        //partial delivery end
    }

    
    // ##################

    // Item.create(req.body, function (err, item) {
    //   if (err) return next(err);
    //   res.json(item);
    // });
  });
  

/* GET SINGLE Order BY req ID */
router.get('/req/:id', function(req, res, next) {

   console.log(req.params.id);
   var stringArr = req.url.split('id=');
   var reqIdInOrderObj  = stringArr[1]; 

   var MongoClient = require("mongodb").MongoClient;
   var url = dbCon.mongoURIConnString;

   MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Orders")
      .find({requisitionId: reqIdInOrderObj })
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.send(result);
        db.close();
      });
  });

});

/* GET ALL Settings */
// router.get("/", function (req, res, next) {
//   var MongoClient = require("mongodb").MongoClient;
//   var url = dbCon.mongoURIConnString;

//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("ProcurementDB");
//     dbo
//       .collection("Settings")
//       .find({})
//       .toArray(function (err, result) {
//         if (err) throw err;
//         // console.log(result);
//         res.send(result);
//         db.close();
//       });
//   });
// });



  /* Add DELIVERED Order to the payment queue  */
  router.post('/pay', async function(req, res, next) {

    try{    
      const orderId = req.body.orderId

      const order = await Order.findById(orderId)

      order.payStatus = true
      order.status = "PAID"
      const saved = await order.save()

      if(saved.payStatus)
        res.status(200).json({success:true, order:saved})
      else
        res.status(200).json({success:false, message:"Failed"})

    }catch(e){
      res.status(200).json({success:false, error:e.message})
    }

  });
/*  get all orders obj which are DELIVERED  {status:DELIVERED} and not paid
  in Orders collection 
*/
router.get('/pay/getUnpaidDelivered', function(req, res, next) {

  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;
  var respCount = 0;
  var result = [];

  MongoClient.connect(url, function (err, db) {
   if (err) throw err;
   var dbo = db.db("ProcurementDB");
   dbo.collection("Orders").find({status: "DELIVERED", payStatus:false }).toArray(function (err, resultOrd) {
       if (err) throw err;
console.log("orders loaded")

      if(resultOrd.length == 0){
        res.send(true);
        db.close();
      }
      
      for(let i = 0;i < resultOrd.length;i++){
            //order loop start
            
            var resObj = {
              orderId : resultOrd[i]._id,
              reqId:resultOrd[i].requisitionId,
              payStatus : false,
              receivedDate: resultOrd[i].receivedDate
            };
            result.push(resObj);

            dbo.collection("Requisitions").find(ObjectId(result[i].reqId)).toArray(function (err, resultReq) {
              //req query start
              if (err) throw err;
              result[i].orderedDate = resultReq[0].requisitionDate
              result[i].price = resultReq[0].totalPrice,
console.log("req loaded for:"+result[i].reqId);
console.log("sending item query for:"+resultReq[0].itemId);
   
              dbo.collection("Items").find(ObjectId(resultReq[0].itemId)).toArray(function (err, resultItem) {
                      if (err){
                        console.log("error loading item for id:"+resultReq[0].itemId,err)
                        throw err;
                      } 
                      
console.log("respCount:"+respCount);
console.log("item loaded for:"+resultReq[0].itemId);

                        var item = resultItem[0];
                        result[i].id= respCount+1;
console.log("resObj.id:"+result[i].id+"::"+result[i].itemName);                
                        result[i].itemName = item.itemName
                        result[i].itemPhoto = item.photoURL11
                        
                        if(respCount++ == resultOrd.length-1){
                          console.log("########");
                          console.log(result);
                          db.close();
                          res.send(result);
                        }

                    }); //item query end
            });//req query end
      }//order loop end
     });
 });



});


module.exports = router;
