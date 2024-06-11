import React, { useState } from "react";
import EditableForm from "./EditableForm";
import UploadReport from "./UploadReport";

export default function Form() {
  const [reportData, setReportData] = useState(null);

  return (
    <div>
      {reportData ? (
        <EditableForm initialData={reportData} />
      ) : (
        <UploadReport onReportData={setReportData} />
      )}
    </div>
  );
}
