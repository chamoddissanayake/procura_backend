var express = require("express");
var router = express.Router();
const dbCon = require("../utils/db_Connection");
const Settings = require('../models/Settings')

/* GET ALL Settings */
router.get("/", function (req, res, next) {
  var MongoClient = require("mongodb").MongoClient;
  var url = dbCon.mongoURIConnString;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("ProcurementDB");
    dbo
      .collection("Settings")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.send(result);
        db.close();
      });
  });
});

/* POST all settings */
router.post("/", async (req, res) => {
  try {
    const newSetting = new Settings(req.body)
    const result = await newSetting.save()
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send("Internal server error", error)
  }
})

module.exports = router;
