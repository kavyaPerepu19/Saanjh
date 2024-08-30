const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const allroutes = express.Router();
const multer = require("multer");
const upload = multer();

// Function to generate a unique user ID
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

// Root endpoint
allroutes.get('/', (req, res) => {
  console.log("Reached root");
  res.send("Backend home");
});


allroutes.post("/submit", async (req, res) => {
  const { userId, date, ...AllData } = req.body;
  
  const reportData = AllData;
  const DocNote = "";
  const dietPlan = "";

  if (!userId || !date || !AllData) {
    return res.status(400).send("User ID, date, and report data are required");
  }

  try {
    const newReportData = new reportDatasModel({
      userId,
      date,
      reportPdf: reportData,
      docNote: DocNote,
      dietPlan: dietPlan,
    });
    
    const savedReportData = await newReportData.save();

    const updatedReportIds = await reportIdsModel.findOneAndUpdate(
      { userId },
      { $push: { ALLreportIDs: savedReportData._id } },
      { upsert: true, new: true }
    );

    console.log(savedReportData);
    res.send({ success: true, message: "Data saved successfully", report: savedReportData, reportIds: updatedReportIds });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Internal Server Error: Failed to save data');
  }
}); 

// Endpoint to get user IDs
allroutes.get('/userIds', async (req, res) => {
  try {
    const userIds = await patientIdModel.find({}, 'userId name');
    res.json(userIds);
  } catch (error) {
    console.error('Error fetching userIds:', error);
    res.status(500).send('Internal Server Error: Failed to fetch userIds');
  }
});

// Endpoint to get reports by user ID
allroutes.get('/reports/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await reportIdsModel.find({ userId });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal Server Error: Failed to fetch reports' });
  }
});

// Endpoint to get report data by report ID
allroutes.get('/reportData/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const reportData = await reportDatasModel.findOne({ _id: reportId });
    if (!reportData) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(reportData);
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
allroutes.post('/previous-diagnoses', async (req, res) => {
  try {
    const { reportIds } = req.body;
    const diagnoses = await predictionsModel.find({ reportIds: { $in: reportIds } });
    res.status(200).json(diagnoses);
  } catch (error) {
    console.error('Error fetching previous diagnoses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

allroutes.post('/updateDocNote', async (req, res) => {
  const { reportId, docNote } = req.body;
  try {
    const updatedReport = await reportDatasModel.findByIdAndUpdate(
      reportId,
      { docNote },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating doctor\'s note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

allroutes.post('/updateDietPlan', async (req, res) => {
  const { reportId, dietPlan } = req.body;
  try {
    const updatedReport = await reportDatasModel.findByIdAndUpdate(
      reportId,
      { dietPlan },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating diet plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to add a new patient
allroutes.post('/addpatient', upload.none(), async (req, res) => {
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
allroutes.post('/login', upload.none(), async (req, res) => {
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

module.exports = allroutes;
