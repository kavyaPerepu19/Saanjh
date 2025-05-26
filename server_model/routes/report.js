const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const reportroutes = express.Router();

const axios = require("axios");
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose')

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyB5Ik4q7mb-GSRjbBVClupgj36TuHqVOoE");

const fileUpload = require('express-fileupload');
reportroutes.use(fileUpload());


reportroutes.post('/diagnose', async (req, res) => {
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


reportroutes.post("/save", (req, res) => {
  const updatedData = req.body;
  // Handle the logic to save the updated data
  // For example, you might save it to a database or a file
  console.log('Received data to save:', updatedData);
  res.send({ success: true, message: "Data saved successfully" });
});

reportroutes.post('/upload', async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded');
  }

  const file = req.files.file;

  try {
    const data = await pdfParse(file.data);
    const extractedText = data.text;
    console.log("Extracted Text:", extractedText);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `${extractedText} Generate a nested dictionary from the text then give a dictionary where the primary keys are Patient Details, test categories (e.g., Blood Group, CBC) and each category contains a dictionary of test names as keys and their values as the test result along with their units as a single string without the range. Ignore non-whitespaces and give correct JSON format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    console.log("Generated Text:", generatedText);

    let dictionaryString = generatedText.substring(generatedText.indexOf('{'), generatedText.lastIndexOf('}') + 1);
    dictionaryString = dictionaryString.replace(/`/g, '').replace(/[\n\r]/g, '').trim();

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
    console.error("Error processing PDF:", error);
    res.status(500).send('Error processing PDF');
  }
});

reportroutes.post("/submit", async (req, res) => {
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

module.exports = reportroutes;