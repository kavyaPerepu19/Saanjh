const express = require('express');
const https = require('https');
const app = express();
const allroutes = require('./routes/AllRoutes');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(bodyParser.json());
app.use(cors());

app.post('/query', (req, res) => {
  const data = JSON.stringify(req.body);
  console.log('Received request:', data);

  const options = {
      hostname: 'api-inference.huggingface.co',
      path: '/models/mistralai/Mistral-7B-Instruct-v0.3',
      //https://api-inference.huggingface.co/models/BioMistral/BioMistral-7B
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
      }
  };

  const apiReq = https.request(options, (apiRes) => {
      let body = '';

      console.log(`Status Code: ${apiRes.statusCode}`);
      console.log('Headers:', apiRes.headers);

      apiRes.on('data', (chunk) => {
          body += chunk;
      });

      apiRes.on('end', () => {
          console.log('Raw API response:', body);
          if (apiRes.headers['content-type'] && apiRes.headers['content-type'].includes('application/json')) {
              try {
                  const result = JSON.parse(body);
                  res.json(result);
              } catch (error) {
                  console.error('Error parsing JSON:', error);
                  res.status(500).send('Internal Server Error: Failed to parse JSON');
              }
          } else {
              console.error('Non-JSON response received:', body);
              res.status(500).send(`Internal Server Error: Non-JSON response received: ${body}`);
          }
      });
  });

  apiReq.on('error', (error) => {
      console.error('Error querying the model:', error);
      res.status(500).send('Internal Server Error: Failed to query the model');
  });

  apiReq.write(data);
  apiReq.end();
});

app.post('/diagnose', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).send("Prompt is required");
  }
  try {
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

app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  console.log(`Received file: ${filePath}`);

  const pythonProcess = spawn("python", ["main.py", filePath]);

  let dataString = '';

  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
    dataString += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).send(`Error in Python script: ${data.toString()}`);
  });

  pythonProcess.on("close", (code) => {
    fs.unlinkSync(filePath);
    console.log(`child process exited with code ${code}`);
    try {
      const result = JSON.parse(dataString);
      console.log(`Parsed result: ${JSON.stringify(result)}`);
      res.json(result);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      res.status(500).send("Error parsing output from Python script");
    }
  });
});

app.post("/save", (req, res) => {
  const updatedData = req.body;
  console.log('Received data to save:', updatedData);
  res.send({ success: true, message: "Data saved successfully" });
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