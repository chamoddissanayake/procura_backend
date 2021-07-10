require("dotenv").config()
var express = require('express');
var router = express.Router();
let Manager = require("../models/Manager")
let StaffMember = require("../models/StaffMember")
let clientTypes = require("../params").clientTypes

const jwt = require("jsonwebtoken")

// login
router.post('/login', async function(req, res, next) {

    try{

        var errors = []
        if (req.body.username == null || req.body.username == '') {
            errors.push("No username provided")
        }
        if (req.body.password == null || req.body.password == '') {
            errors.push("No password provided")
        }
        if (req.body.type == null || req.body.type == '') {
            errors.push("No member type provided")
        }
        
        if (errors.length == 0) {
            const reqData = req.body
            
            let user = null
            console.log(reqData.type)
            
            //Is a manager ?
            if(reqData.type === clientTypes.MANAGER){
                user = await Manager.findOne({ username: reqData.username, password: reqData.password })
                console.log(user.id);
                if(user.id){
                    sendJWT_SignedResponse(user, res, clientTypes.MANAGER)
                }else{
                    res.status(401).json({ success: false, message: "No User found" })
                }
            }
            //Is a staff member ?
            else if(reqData.type === clientTypes.STAFF_MEMBER){
                user = await StaffMember.findOne({ username: reqData.username, password: reqData.password })
                console.log(user.id);
                if(user.id){
                    sendJWT_SignedResponse(user, res, clientTypes.STAFF_MEMBER)
                }else{
                    res.status(401).json({ success: false, message: "No User found" })
                }
            }else{
                res.status(401).json({ success: false, message: "No User found" })
            }
        } else {
            res.status(200).json({ success: false, errors: errors })
        }
    }catch(e){
        res.status(200).json({ success: false, errors: e.message })
    }
});
    
// Sends a response wrapping the JWT Sign
function sendJWT_SignedResponse(loggedInUser, res, userType) {
    
    if (loggedInUser !== null) {
        loggedInUser.password = undefined;
        const access_token = jwt.sign({ user: loggedInUser.toJSON(), userType: userType }, process.env.ACCESS_TOKEN_SECRET)
        res.status(200).json({ accessToken: access_token, user: loggedInUser, userType: userType })
    }
    else {
        res.status(200).json({ success: false, message: "Error occurred when signing in" })
    }
}
    
    

module.exports = router;


