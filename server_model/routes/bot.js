const express = require("express");
// const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const botroutes = express.Router();

const axios = require("axios");



botroutes.post('/ask-question', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await axios.post(`${process.env.FLASK_BACKEND_BOT}/ask`, { question });
    res.json(response.data);
    console.log(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = botroutes;