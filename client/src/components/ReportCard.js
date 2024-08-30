import React, { useState } from 'react';

const ReportCard = ({ title, content, reportId, noteType, editable, reloadData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(content);

  const handleAddNote = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/update${noteType === 'docNote' ? 'DocNote' : 'DietPlan'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          [noteType]: note
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const updatedReport = await response.json();
      console.log('Updated report:', updatedReport);
      setIsEditing(false);
      reloadData();  // Reload the data after updating the note
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reloadData();  // Reload the data when canceling edit
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {isEditing ? (
        <div>
          <textarea 
            className="w-full border border-gray-300 p-2 rounded mb-4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button 
            onClick={handleAddNote} 
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
          >
            Save
          </button>
          <button 
            onClick={handleCancelEdit} 
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p>{content}</p>
          {editable && (
            <>
              {(content === "Doctor has not given a note yet." || content === "Doctor has not given a diet plan yet.") && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Add {noteType === 'docNote' ? "Doctor's Note" : 'Diet Plan'}
                </button>
              )}
              {content !== "Doctor has not given a note yet." && content !== "Doctor has not given a diet plan yet." && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded"
                >
                  Edit
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;
