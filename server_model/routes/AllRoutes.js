let express = require("express");
const {housesModel,usersModel,enquiriesModel} = require("../schemas/allSchemas");
let allroutes = express.Router();
const multer = require("multer");
const upload = multer();
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
allroutes.get('/',(req,res) => {
    console.log(" reached root");
    res.send("backend home");
});



allroutes.post('/signup',upload.none(),async (req,res) =>{

    try{ 
        console.log(req.body);
        let newuser = new usersModel(req.body)
        let userFromDB = await newuser.save();
        console.log(userFromDB);
        res.send(userFromDB);
    }
    catch(err){
        console.log(" error while adding user. check if it is duplicate");
        console.log(err);
        res.status(500).send(err)
    }
});

allroutes.post('/login', upload.none(), async (req, res) => {
    try {
        console.log(req.body);
        let user = await usersModel.findOne({ username: req.body.username });
        
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        if (user.password !== req.body.password) {
            return res.status(400).send('Invalid username or password');
        }

        res.send({ success: true, user });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


  




module.exports = allroutes;