const express = require('express');

const app = express();

const allroutes = require('./routes/AllRoutes');
const botroutes = require('./routes/bot');
const reportroutes = require('./routes/report');
const dataroutes = require('./routes/data');
const logroutes = require('./routes/log');
const diagroutes = require('./routes/prevdiag')
const updateroutes = require('./routes/updatereport');
const mongoose = require('mongoose');

const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());



const bodyParser = require("body-parser");



dotenv.config();
app.use(bodyParser.json());
app.use(cors());





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

// app.use('/api', allroutes);
app.use('/api/', botroutes);
app.use('/api/', reportroutes);
app.use('/api/', dataroutes);
app.use('/api/', logroutes);
app.use('/api/', diagroutes);
app.use('/api/', updateroutes);

const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});