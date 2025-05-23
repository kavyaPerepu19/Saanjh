import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SelectPatient = ({ onSelectPatient }) => {
  const [patientIds, setPatientIds] = useState([]);

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

  const handlePatientSelect = (userId) => {
    onSelectPatient(userId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Patient</h2>
      <div className="w-full max-w-4xl bg-white p-8 rounded shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patientIds.map((patient) => (
                <tr key={patient.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handlePatientSelect(patient.userId)}
                      className=" text-white font-normal py-2 px-4 rounded"
                      style={{background:'#88D2D8'}}
                    >
                      Upload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SelectPatient;
