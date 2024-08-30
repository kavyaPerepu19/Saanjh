import React, { useState } from 'react';
import UploadReport from './UploadReport';
import EditableForm from './EditableForm';
import PatientSel from './SelectPatient';

export default function Form() {
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
    <div>
      {selectedPatientId === '' ? (
        <PatientSel onSelectPatient={handlePatientSelect} />
      ) : reportData ? (
        <EditableForm initialData={reportData} selectedPatientId={selectedPatientId} />
      ) : (
        <UploadReport selectedPatientId={selectedPatientId} onReportData={handleReportData} />
      )}
    </div>
  );
}
