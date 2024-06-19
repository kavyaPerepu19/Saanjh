import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UploadReport = ({selectedPatientId, onReportData }) => {
  const backgroundStyle = {
    backgroundImage: "url('https://wallpaperaccess.com/full/958470.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    position: 'relative',
  };

  const blurOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(6px)',
    zIndex: 0,
  };
  const contentStyle = {
    zIndex: 1,
    position: 'absolute',
    top: '50%',
    left: '40%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto, sans-serif',
  };
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [diagnosisReport, setDiagnosisReport] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  console.log('Selected Patient ID:', selectedPatientId); 
  const handleUpload = async () => {
    console.log('Upload button clicked'); // Check if function is called

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server response:', response.data); // Check server response
      onReportData(response.data);
      setDiagnosisReport(response.data); // Ensure this is the correct path
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file');
    }
  };

  useEffect(() => {
    if (diagnosisReport) {
      console.log('Diagnosis Report:', diagnosisReport); // Check state update
    }
  }, [diagnosisReport]);

  return (
    <div >
      <div style={blurOverlayStyle}></div>
      <div style={contentStyle}>
    <div className='rounded-xl' style={ { display: 'flex',alignItems:'center', justifyContent: 'center', marginTop: '3rem', width:'300px',
      height: '200px',marginLeft:'38%',marginTop:'15%',backgroundColor: 'rgba(220, 220, 220, 0.76)' }}>
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          id="file-upload"
          style={{ display: 'none' }} // Hide the default file input
        />
        <label
          htmlFor="file-upload"
          className="custom-file-upload text-dark font-medium rounded-lg text-s px-3 py-2 text-center me-2 mb-2"
        >
          Select File
        </label>
        <div>
          <button
            type="button"
            className="mt-2 mx-1 text-light bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-3 py-2 text-center me-2 mb-2"
            onClick={handleUpload}
          >
            Upload Report
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default UploadReport;
