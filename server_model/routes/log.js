const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const logroutes = express.Router();

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

logroutes.post('/addpatient', async (req, res) => {
  try {
    console.log(req.body);
    const userId = await generateUniqueUserId();

    // Ensure all required fields are present in the request
    const { name, age, gender } = req.body;
    if (!name || !age || !gender) {
      return res.status(400).send('Missing required fields: name, age, gender');
    }

    // Fetch all caretakers
    const caretakers = await careIDsModel.find({});

    if (caretakers.length === 0) {
      throw new Error('No caretakers available');
    }

    // Find the caretaker with the fewest patients
    let minLength = Infinity;
    let assignedCaretaker = null;

    caretakers.forEach(caretaker => {
      if (caretaker.patientIds.length < minLength) {
        minLength = caretaker.patientIds.length;
        assignedCaretaker = caretaker;
      }
    });

    if (!assignedCaretaker) {
      throw new Error('Unable to find a caretaker with minimum patients');
    }

    // Create a new patient
    let newPatient = new patientIdModel({
      userId,
      name,
      age,
      gender,
      caretakerId: assignedCaretaker.userId
    });

    let patientFromDB = await newPatient.save();
    let newReportId = new reportIdsModel({
      userId,
      ALLreportIDs: [],
      PredictionID: []
    });
    let ReportIdfromDb = await newReportId.save();

    // Update the caretaker's patientIds array
    assignedCaretaker.patientIds.push(userId);
    await assignedCaretaker.save();

    console.log(patientFromDB, ReportIdfromDb);
    res.send(patientFromDB);
  } catch (err) {
    console.log("Error while adding patient. Check if it is duplicate.");
    console.log(err);
    res.status(500).send(err);
  }
});

// Endpoint to sign up a new user
logroutes.post('/signup',  async (req, res) => {
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

    let newCareTaker = new careIDsModel({
      userId,
      patientIds: []
    });

    let careTakerFromDB = await newCareTaker.save();

    console.log(userFromDB);
    console.log(careTakerFromDB);

    res.send(userFromDB);
  } catch (err) {
    console.log("Error while adding user. Check if it is duplicate.");
    console.log(err);
    res.status(500).send(err);
  }
});

// Endpoint to log in a user
logroutes.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    let user = await usersModel.findOne({ username: req.body.username });

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

module.exports = logroutes;