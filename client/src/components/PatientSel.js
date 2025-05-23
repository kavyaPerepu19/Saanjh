import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientSel = ({ onSelectPatient }) => {
  const [patientIds, setPatientIds] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    fetchPatientIds();
  }, []);

  const fetchPatientIds = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/userIds');
      setPatientIds(response.data); 
    } catch (error) {
      console.error('Error fetching patient IDs:', error);
    }
  };

  const handlePatientIdChange = (e) => {
    setSelectedPatientId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelectPatient(selectedPatientId); // Notify parent component (Form) of selected patient ID
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-6 ">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <h2 className="text-3xl font-extrabold text-dark text-center mb-6">Upload Data</h2>
        <form onSubmit={handleSubmit} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label htmlFor="patientId" className="block text-sm font-bold text-gray-700 mb-2">Select Patient ID</label>
            <select
              className="form-select block w-full mt-1 p-2 border border-gray-300 rounded"
              id="patientId"
              name="patientId"
              value={selectedPatientId}
              onChange={handlePatientIdChange}
            >
              <option value="" disabled>-- Select Patient ID --</option>
              {patientIds.map(patient => (
                <option key={patient.userId} value={patient.userId}>{patient.userId} - {patient.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientSel;
