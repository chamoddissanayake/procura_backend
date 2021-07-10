var express = require('express');
var router = express.Router();
var Requisition = require('../models/Requisition');
var Order = require("../models/Order");
var Item = require("../models/Item");
var Location = require("../models/Location");
var SiteManager = require("../models/SiteManager");
var Supplier = require("../models/Supplier");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/CollectionCount', async function (req, res, next) {
  console.log("hi");
  let requisition;
  let order;
  let item;
  let location;
  let sitemanager;
  let supplier;
  let DetailsArray = [];
  try {
    requisition = await Requisition
      .count()

    order = await Order
      .count()

    item = await Item
      .count()

    location = await Location
      .count()

    sitemanager = await SiteManager
      .count()

    supplier = await Supplier
      .count()

    DetailsArray = { requisition: requisition, order: order, item: item, location: location, sitemanager: sitemanager, supplier: supplier }
  } catch (e) {
    console.log("ERROR:", e);
    res.status(200).json({ 'success': false, 'error': e.message })
  } finally {
    if (DetailsArray) {
      res.status(200).json({ 'success': true, DetailsArray: DetailsArray })
    }
  }
});


module.exports = router;
