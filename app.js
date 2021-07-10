var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const dbCon = require("./utils/db_Connection");
var mongoose = require("mongoose");

var url = dbCon.mongoURIConnString.toString();
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, poolSize:1 });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB!");
});

var indexRouter = require("./routes/index");
var authRouter = require("./routes/authRouter");
var RequisitionRouter = require("./routes/RequisitionRouter");
var SiteManagerRouter = require("./routes/SiteManagerRouter");
var ItemRouter = require("./routes/ItemRouter");
var SettingsRouter = require("./routes/SettingsRouter");
var SupplierRouter = require("./routes/SupplierRouter");
var LocationRouter = require("./routes/LocationRouter");
var OrderRouter = require("./routes/OrderRouter");
var PaymentsRouter = require("./routes/PaymentsRouter");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/siteManager", SiteManagerRouter);
app.use("/requisition", RequisitionRouter);
app.use("/item", ItemRouter);
app.use("/settings", SettingsRouter);
app.use("/supplier", SupplierRouter);
app.use("/location", LocationRouter);
app.use("/order", OrderRouter);
app.use("/payment", PaymentsRouter);




var cors = require("cors");
app.use(cors({ origin: true, credentials: true }));
const PORT = 7000;
app.listen(PORT, () => {
  console.log("Server listening on port :" + PORT);
});

module.exports = app;
