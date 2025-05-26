const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const dataroutes = express.Router();






dataroutes.get('/userIds', async (req, res) => {
  try {
    const userIds = await patientIdModel.find({}, 'userId name');
    res.json(userIds);
  } catch (error) {
    console.error('Error fetching userIds:', error);
    res.status(500).send('Internal Server Error: Failed to fetch userIds');
  }
});

// Endpoint to get reports by user ID
dataroutes.get('/reports/:userId', async (req, res) => {
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
dataroutes.get('/reportData/:reportId', async (req, res) => {
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




module.exports = dataroutes;