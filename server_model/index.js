const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const botroutes = require('./routes/bot');
const reportroutes = require('./routes/report');
const dataroutes = require('./routes/data');
const logroutes = require('./routes/log');
const diagroutes = require('./routes/prevdiag');
const updateroutes = require('./routes/updatereport');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use('/api/', botroutes);
app.use('/api/', reportroutes);
app.use('/api/', dataroutes);
app.use('/api/', logroutes);
app.use('/api/', diagroutes);
app.use('/api/', updateroutes);

// MongoDB caching logic for Vercel serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DBURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000,
    }).then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    }).catch((err) => {
      console.error("MongoDB connection error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Handler for Vercel
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res); // Express handles the request
};
