const express = require("express");
const { usersModel, patientIdModel,reportsModel } = require("../schemas/allSchemas");
const allroutes = express.Router();
const multer = require("multer");
const upload = multer();

const generateUniqueUserId = async () => {
  let unique = false;
  let userId;

  while (!unique) {
    userId = Math.floor(1000 + Math.random() * 9000).toString();
    let existingUser = await patientIdModel.findOne({ userId });
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
    const userIds = await patientIdModel.find({}, 'userId username name');
    res.json(userIds);
  } catch (error) {
    console.error('Error fetching userIds:', error);
    res.status(500).send('Internal Server Error: Failed to fetch userIds');
  }
});

allroutes.get('/reports/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching reports for userId:', userId);

  try {
    const reports = await reportsModel.find({ userId });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error: Failed to fetch reports');
  }
}
);

allroutes.get('/reports/:userId/:week', async (req, res) => {
  const { userId, week } = req.params;
  console.log('Fetching reports for userId:', userId, 'week:', week);
  try {
    const report = await reportsModel.find({ userId, week });
    res.json(report);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error: Failed to fetch reports');
  }
}
);

allroutes.get('/allreports', async (req, res) => {
  try {
    const reports = await reportsModel.find({});
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error: Failed to fetch reports');
  }
}
);


allroutes.post('/signup', upload.none(), async (req, res) => {
  try {
    console.log(req.body);
    const userId = await generateUniqueUserId();

    let newUser = new usersModel({
      userId,
      username: req.body.username,
      password: req.body.password,
      userType: "Care Taker"
    });

    let userFromDB = await newUser.save();
    

   

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
    let user = await usersModel.findOne({ userId: req.body.userId });

    if (!user) {
      return res.status(400).send('Invalid username or password');
    }

    if (user.password !== req.body.password) {
      return res.status(400).send('Incorrect password');
    }

    res.send({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});


allroutes.post("/save", async (req, res) => {
  const { userId, week, ...reportData } = req.body;
  const  Prediction = "";
  const DocNote = "";
  const dietPlan = "";
  console.log('Received data to save:', req.body);

  if (!userId || !week || !reportData) {
    return res.status(400).send("User ID, week number, and report data are required");
  }

  try {
    const report = new reportsModel({ userId, week, reportData ,Prediction,DocNote,dietPlan});
    await report.save();
    res.send({ success: true, message: "Data saved successfully" });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Internal Server Error: Failed to save data');
  }
});


module.exports = allroutes;
