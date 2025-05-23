const express = require('express');
const https = require('https');
const app = express();
const axios = require('axios');
const allroutes = require('./routes/AllRoutes');
const mongoose = require('mongoose');
// const {predictionsModel,reportIdsModel,reportDatasModel}=require("./schemas/allSchemas");
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
const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});