const express = require("express");
const { usersModel, patientIdModel, reportIdsModel, careIDsModel, reportDatasModel ,predictionsModel} = require("../schemas/allSchemas");
const diagroutes = express.Router();




diagroutes.post('/previous-diagnoses', async (req, res) => {
    try {
      const { reportIds } = req.body;
      const diagnoses = await predictionsModel.find({ reportIds: { $in: reportIds } });
      res.status(200).json(diagnoses);
    } catch (error) {
      console.error('Error fetching previous diagnoses:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = diagroutes;