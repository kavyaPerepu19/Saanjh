const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const updateroutes = express.Router();

updateroutes.post('/updateDocNote', async (req, res) => {
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
  
  updateroutes.post('/updateDietPlan', async (req, res) => {
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

module.exports = updateroutes;

