  
const mongoose = require('mongoose')
const dbString = require('./db_Connection.js')

mongoose
    .connect(dbString.mongoURIConnString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize:1
    })
    .catch(e => {
        console.error('DB Connection error', e.message)
    })

const db = mongoose.connection
db.once("open", () => {
    console.log("Connected to MongoDB");
})

module.exports = db