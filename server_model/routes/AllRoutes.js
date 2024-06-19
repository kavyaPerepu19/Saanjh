const express = require("express");
const { usersModel, userIdModel } = require("../schemas/allSchemas");
const allroutes = express.Router();
const multer = require("multer");
const upload = multer();

// Function to generate unique 4-digit user ID
const generateUniqueUserId = async () => {
  let unique = false;
  let userId;

  while (!unique) {
    userId = Math.floor(1000 + Math.random() * 9000).toString(); 
    let existingUser = await userIdModel.findOne({ userId });
    if (!existingUser) {
      unique = true;
    }
  }

  return userId;
};

allroutes.get('/', (req, res) => {
  console.log("Reached root");
  res.send("Backend home");
});
allroutes.get('/userIds', async (req, res) => {
  try {
  
    const userIds = await userIdModel.find({}, 'userId username');

    
    res.json(userIds);
  } catch (error) {
    console.error('Error fetching userIds:', error);
    res.status(500).send('Internal Server Error: Failed to fetch userIds');
  }
});
allroutes.post('/signup', upload.none(), async (req, res) => {
  try {
    console.log(req.body);
    const userId = await generateUniqueUserId(); // Generate a unique 4-digit user ID

    let newUser = new usersModel({
      userId,
      username: req.body.username,
      password: req.body.password,
      userType: req.body.userType
    });

    let userFromDB = await newUser.save();

    if (req.body.userType === "patient") {
      let newUserId = new userIdModel({
        username: req.body.username,
        userId
      });
      await newUserId.save();
    }

    console.log(userFromDB);
    res.send(userFromDB);
  } catch (err) {
    console.log("Error while adding user. Check if it is duplicate.");
    console.log(err);
    res.status(500).send(err);
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
