const express = require('express');
const https = require('https');
const app = express();
const allroutes = require('./routes/AllRoutes');
const mongoose = require('mongoose');
const {predictionsModel,reportIdsModel,reportDatasModel}=require("./schemas/allSchemas");
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const pdfParse = require('pdf-parse');

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");


dotenv.config();


app.use(bodyParser.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


app.post('/diagnose', async (req, res) => {
  let { prompt}  = "req.body";
  if (!prompt) {
    return res.status(400).send("Prompt is required");
  }
  try {
    prompt= prompt + "Your rsponse should consist of 2 parts. The first part is the disease/ diagnosis you made, justification for it with heading Predicted disease: and second part is the risk of the person classify as low, medium or high risk  with heading Risk Prediction: and give a percentage for risk and do not give any other text";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.send(text);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to generate content");
  }
});


app.post('/predict', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({ error: 'userId is required' });
  }

  try {
    // Find the reportIds object for the user
    const reportIds = await reportIdsModel.findOne({ userId });

    if (!reportIds || !reportIds.ALLreportIDs || reportIds.ALLreportIDs.length === 0) {
      return res.status(404).send({ error: 'No reports found for the user' });
    }

    // Retrieve the last three report IDs
    const lastThreeReportIds = reportIds.ALLreportIDs.slice(-3);

    // Fetch the last three reports' data
    const reportsDataPromises = lastThreeReportIds.map(reportId =>
      reportDatasModel.findOne({ userId, _id: reportId }).then(report => {
        if (!report || !report.reportPdf) {
          console.log(`Report ${reportId} is missing reportPdf data`);
          return null;
        }
        
        // Convert the reportPdf object to a string
        let reportText = JSON.stringify(report.reportPdf, null, 2);
        return reportText;
      })
    );

    const reportsTexts = await Promise.all(reportsDataPromises);

    // Filter out null values
    const validReportsTexts = reportsTexts.filter(text => text !== null);

    if (validReportsTexts.length === 0) {
      return res.status(404).send({ error: 'No valid reports found for the user' });
    }

    // Prepare data for Gemini
    let prompt = 'Analyze the following medical reports and provide your predictions. Reports:\n';
    validReportsTexts.forEach((text, index) => {
      prompt += `Report ${index + 1}:\n${text}\n`;
    });
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
      reportIds: lastThreeReportIds,
      LLMPrediction: disease ? disease.trim() : 'N/A',
      riskPercent: riskPercent
    });

    await newPrediction.save();

    // Send the prediction back to the client
    res.send(newPrediction);

  } catch (error) {
    console.error('Error processing prediction:', error);
    res.status(500).send({ error: error.message });
  }
});





app.post('/chatbot',async(req,re)=>{
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
app.post('/upload', upload.single('file'), async (req, res) => {
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
      const prompt = `${extractedText} Generate a nested dictionary from the text  then give a dictionary where the primary keys are Patient Details,test categories (e.g., Blood Group, CBC) and each category contains a dictionary of test names as keys and their values as the test result along with their units as a single string without the range. ignore non whitespaces and give correct json format`;
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
      console.log(error);
      res.status(500).send("Failed to generate content");
    }
  } catch (error) {
    console.error("Error processing PDF:", error);

   
    fs.unlinkSync(filePath);

    res.status(500).send('Error processing PDF');
  }
});



let db = async () => { 
  try{ 
      console.log(process.env.DBURI);
      await mongoose.connect(process.env.DBURI);
      console.log("connected to database");
  }
  catch(err) {
      console.log('error connecting');
  }
}
db();

app.use('/api', allroutes);
const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
