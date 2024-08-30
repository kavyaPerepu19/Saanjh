import React, { useState } from 'react';
import axios from 'axios';

const UploadReport = ({ onReportData }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Reset error when a new file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8080/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onReportData(response.data.details); // Ensure this is the correct path
    } catch (error) {
      setError('Error uploading file. Please try again.');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Report</h2>
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-m text-gray-700 mb-4 border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white font-normal py-2 px-4 rounded"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default UploadReport;
