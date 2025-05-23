const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const allroutes = express.Router();
const multer = require("multer");
const upload = multer();
const axios = require("axios");
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose')
const https = require('https');


const { handleUserQuery } = require('../chatbotHandler'); // Adjust the path as needed
// const {
//   usersModel,
//   patientIdModel,
//   careIDsModel,
// } = require('./schemas/allSchemas'); 

allroutes.post('/chat', async (req, res) => {
  const { query } = req.body;
  const response = await handleUserQuery(query);
  res.send(response);
});





allroutes.post('/pedict', async (req, res) => {
  const { userId, reportId } = req.body;

  if (!userId || !reportId) {
    return res.status(400).send({ error: 'userId and reportId are required' });
  }

  try {
    // Find the specific report for the user
    const report = await reportDatasModel.findOne({ userId, _id: reportId });

    if (!report || !report.reportPdf) {
      return res.status(404).send({ error: 'Report not found or missing reportPdf data' });
    }

    // Convert the reportPdf object to a string
    let reportText = JSON.stringify(report.reportPdf, null, 2);

    // Prepare data for Gemini
    let prompt = `Analyze the following medical report and provide your prediction. Report:\n${reportText}\n`;
    prompt += " Your response should consist of 2 parts. The first part is the disease/diagnosis you made, justification for it with heading Predicted disease: and the second part is the risk of the person classified as low, medium, or high risk with the heading Risk Prediction: followed by a percentage for risk. Do not include any other text.";

    // Send data to Gemini for prediction
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Log the response text for debugging
    console.log('Gemini API response:', text);

    // Extract the prediction details from the response text
    const [predictedDisease, riskPrediction] = text.split('Risk Prediction:');

    // Check if the response contains the expected parts
    if (!predictedDisease || !riskPrediction) {
      return res.status(500).send({ error: 'Invalid response format from Gemini API' });
    }

    const [diseaseHeading, disease] = predictedDisease.split('Predicted disease:');

    // Extract the numeric risk percentage
    const riskPercentMatch = riskPrediction.match(/(\d+)%/);
    const riskPercent = riskPercentMatch ? parseInt(riskPercentMatch[1], 10) : null;

    if (riskPercent === null) {
      return res.status(500).send({ error: 'Invalid risk percentage format from Gemini API' });
    }

    // Save the prediction in the database
    const newPrediction = new predictionsModel({
      predictionId: new mongoose.Types.ObjectId().toString(),
      userId,
      reportIds: [reportId],
      LLMPrediction: disease ? disease.trim() : 'N/A',
      riskPercent: riskPercent
    });

    await newPrediction.save();

    // Update the reportIdsModel with the new prediction ID
    const reportIds = await reportIdsModel.findOne({ userId });
    reportIds.PredictionID.push(newPrediction.predictionId);
    await reportIds.save();

    // Send the prediction back to the client
    res.send(newPrediction);

  } catch (error) {
    console.error('Error processing diagnosis:', error);
    res.status(500).send({ error: error.message });
  }
});



allroutes.post('/diagnose', async (req, res) => {
  const { userId, reportId } = req.body;

  if (!userId || !reportId) {
    return res.status(400).send({ error: 'userId and reportId are required' });
  }

  try {
    // Find the specific report for the user
    const report = await reportDatasModel.findOne({ userId, _id: reportId });
    console.log(report)
    if (!report || !report.reportPdf) {
      return res.status(404).send({ error: 'Report not found or missing reportPdf data' });
    }

    // Convert the reportPdf object to a string
    let reportText = JSON.stringify(report.reportPdf, null, 2);
    reportText +="diagnoise the report and predict the disease ";
    // Make the request to the Flask API
    const response = await axios.post(`${process.env.FLASK_BACKEND_ollama}/diagnose`, {
      content: reportText
    });
    
    const diagnosis = response.data.diagnosis;
    const riskMatch = diagnosis.match(/risk percentage: (\d+)%/i);
    const riskPercent = riskMatch ? parseInt(riskMatch[1], 10) : null;


    // Save the prediction in the database
    const newPrediction = new predictionsModel({
      predictionId: new mongoose.Types.ObjectId().toString(),
      userId,
      reportIds: [reportId],
      LLMPrediction: diagnosis,
      riskPercent: riskPercent
    });

    await newPrediction.save();

    // Update the reportIdsModel with the new prediction ID
    const reportIds = await reportIdsModel.findOne({ userId });
    reportIds.PredictionID.push(newPrediction.predictionId);
    await reportIds.save();

    // Send the prediction back to the client
    res.send(newPrediction);

  } catch (error) {
    console.error('Error processing diagnosis:', error);
    res.status(500).send({ error: error.message });
  }
});





allroutes.post('/chatbot',async(req,res)=>{
  let {prompt} = req.body;
  if (!prompt) {
    return res.status(400).send("Prompt is required");
  }
  try{
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.send(text);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to generate content");
  }

})


allroutes.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const filePath = path.join(__dirname, req.file.path);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    fs.unlinkSync(filePath);

    const extractedText = data.text;
    console.log("Extracted Text:", extractedText);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${extractedText} Generate a nested dictionary from the text then give a dictionary where the primary keys are Patient Details, test categories (e.g., Blood Group, CBC) and each category contains a dictionary of test names as keys and their values as the test result along with their units as a single string without the range. Ignore non-whitespaces and give correct JSON format.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      console.log("Generated Text:", generatedText);

      let dictionaryString = generatedText.substring(generatedText.indexOf('{'), generatedText.lastIndexOf('}') + 1);
      dictionaryString = dictionaryString.replace(/`/g, '').replace(/[\n\r]/g, '').trim();

      console.log("Cleaned Dictionary String:", dictionaryString);

      let dictionary;
      try {
        dictionary = JSON.parse(dictionaryString);
      } catch (parseError) {
        console.log("First parsing error:", parseError);

        dictionaryString = dictionaryString.replace(/[^a-zA-Z0-9:{}\[\],\"\' ]/g, '');
        console.log("Further cleaned Dictionary String:", dictionaryString);

        try {
          dictionary = JSON.parse(dictionaryString);
        } catch (finalParseError) {
          console.log("Final parsing error:", finalParseError);

          const patientDetailsStart = dictionaryString.indexOf('{');
          const testResultsStart = dictionaryString.indexOf('testresults');

          if (patientDetailsStart !== -1 && testResultsStart !== -1) {
            const patientDetailsString = dictionaryString.substring(patientDetailsStart, testResultsStart).trim();
            const testResultsString = dictionaryString.substring(testResultsStart + 'testresults'.length).trim();

            try {
              const patientDetails = JSON.parse(patientDetailsString);
              const testResults = JSON.parse(testResultsString);

              dictionary = {
                patientdetails: patientDetails,
                testresults: testResults,
              };
            } catch (manualParseError) {
              console.log("Manual parsing error:", manualParseError);
              return res.status(500).send("Failed to parse generated dictionary");
            }
          } else {
            return res.status(500).send("Failed to parse generated dictionary");
          }
        }
      }

      console.log("Generated Dictionary:", dictionary);
      res.json({ details: dictionary });

    } catch (error) {
      console.log("Error generating content:", error);
      res.status(500).send("Failed to generate content");
    }

  } catch (error) {
    console.error("Error processing PDF:", error);
    fs.unlinkSync(filePath);
    res.status(500).send('Error processing PDF');
  }
});

allroutes.post("/save", (req, res) => {
  const updatedData = req.body;
  // Handle the logic to save the updated data
  // For example, you might save it to a database or a file
  console.log('Received data to save:', updatedData);
  res.send({ success: true, message: "Data saved successfully" });
});


allroutes.post('/ask-question', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await axios.post(`${process.env.FLASK_BACKEND_BOT}/ask`, { question });
    res.json(response.data);
    console.log(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


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
