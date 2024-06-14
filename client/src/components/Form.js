import React, { useState } from "react";
import EditableForm from "./EditableForm";
import UploadReport from "./UploadReport";

export default function Form() {
  const backgroundStyle = {
    backgroundImage: "url('https://wallpaperaccess.com/full/958470.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    position: 'relative',
     overflowY: 'auto'
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
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto, sans-serif',
    background: 'rgba(220, 220, 220, 0.5)',
    maxHeight:'92%',
    marginTop: '8%',
    // marginBottom: '10%',
  };

  
  const [reportData, setReportData] = useState(null);
  

  return (
    <div style={backgroundStyle} >
    {/* <div style={{marginTop: '150px'}}> */}
         
      {/* <div style={blurOverlayStyle}></div> */}
      {/* <div style={contentStyle}> */}
      {reportData ? (
        <EditableForm initialData={reportData} />
      ) : (
        <UploadReport  className='bg-light' onReportData={setReportData} />
      )}
    </div>
    // </div>
    // </div>
  );
}
