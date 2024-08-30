import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReportCard from './ReportCard';
import MedicalReport from './MedicalReport';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const ReportsDisplay = () => {
  const { reportId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [previousDiagnoses, setPreviousDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const userType = sessionStorage.getItem('userType'); // Get userType from sessionStorage

  // Function to fetch report data
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reportData/${reportId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching report data:', error);
    }
  };

  // Function to handle diagnosis
  const handleDiagnose = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/diagnose', { userId: reportData.userId, reportId });
      setPrediction(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.error('Error diagnosing:', error);
    }
  };

  // Function to fetch previous diagnoses
  const fetchPreviousDiagnoses = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/api/previous-diagnoses', { reportIds: [reportId] });
      setPreviousDiagnoses(response.data);
      if (response.data.length === 0) {
        setPreviousDiagnoses([{ LLMPrediction: 'No previous diagnoses found. To diagnose, click on Diagnose again.', riskPercent: 'null' }]);
      }
      
      console.log("Previous Diagnoses", response.data);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        setPreviousDiagnoses([{ LLMPrediction: 'No previous diagnoses found. To diagnose, click on Diagnose again.', riskPercent: null }]);
      } else {
        setError(error.message);
      }
      setLoading(false);
      console.error('Error fetching previous diagnoses:', error);
    }
  };

  // Fetch report data on component mount or when reportId changes
  useEffect(() => {
    fetchData();
  }, [reportId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!reportData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow w-full p-4">
        <div className="space-y-6 w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Resident's Report</h1>
          </div>
          <div className="space-y-6">
            {reportData && reportData.reportPdf ? (
              <MedicalReport data={reportData.reportPdf} />
            ) : (
              <div>No report data available.</div>
            )}

            {/* Diagnose and Fetch Previous Diagnoses Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleDiagnose}
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Diagnose'}
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={fetchPreviousDiagnoses}
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Show Previous Diagnoses'}
              </button>
            </div>

            {/* Display Prediction */}
            {prediction && (
              <div className="p-4 border border-gray-300 rounded-lg mt-4">
                <h2 className="text-xl font-bold mb-2">Diagnosis Result</h2>
                <p><strong>Predicted Disease:</strong> {prediction.LLMPrediction}</p>
                <p><strong>Risk Prediction:</strong> {prediction.riskPercent}%</p>
              </div>
            )}

            {/* Display Previous Diagnoses */}
            {previousDiagnoses.length > 0 && (
              <div className="p-4 border border-gray-300 rounded-lg mt-4">
                <h2 className="text-xl font-bold mb-2">Previous Diagnoses</h2>
                <ul>
                  {previousDiagnoses.map((diagnosis, index) => (
                    <li key={index}>
                      <strong>Diagnosis {index + 1}:</strong> {diagnosis.LLMPrediction} - {diagnosis.riskPercent}%
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Report Cards */}
            <ReportCard 
              title="Doctor's Note" 
              content={reportData.docNote || "Doctor has not given a note yet."} 
              reportId={reportId} 
              noteType="docNote" 
              editable={userType === 'doctor'} 
              reloadData={fetchData}
            />
            <ReportCard 
              title="Diet Plan" 
              content={reportData.dietPlan || "Doctor has not given a diet plan yet."} 
              reportId={reportId} 
              noteType="dietPlan" 
              editable={userType === 'doctor'} 
              reloadData={fetchData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDisplay;
