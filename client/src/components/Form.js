import React, { useState } from "react";
import EditableForm from "./EditableForm";
import UploadReport from "./UploadReport";
import PatientSel from "./PatientSel";

export default function Form() {
  const backgroundStyle = {
    backgroundImage: "url('https://wallpaperaccess.com/full/958470.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    position: 'relative',
    overflowY: 'auto',
    
  };

  const blurOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(6px)',
    zIndex: 0,
     overflowY: 'auto'
  };

  const contentStyle = {
    zIndex: 1,
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto, sans-serif',
  
    maxHeight:'92%',
    marginTop: '8%',
    overflowY: 'auto'
  };

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reportData, setReportData] = useState(null);

  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId); // Update selectedPatientId in Form.js
    console.log('Selected Patient ID in Form:', patientId); // Verify patientId is received here
  };

  const handleReportData = (data) => {
    setReportData(data);
  };

  return (
    <div style={backgroundStyle}>
      <div style={blurOverlayStyle}></div>
      <div style={contentStyle}>
        {selectedPatientId === '' ? (
          <PatientSel onSelectPatient={handlePatientSelect} />
        ) : reportData ? (
          <div>
          <EditableForm className='my-1'initialData={reportData} selectedPatientId={selectedPatientId} />
          <br></br>
          </div>
        ) : (
          <UploadReport selectedPatientId={selectedPatientId} onReportData={handleReportData} />
        )}
      </div>
    </div>
  );
}
