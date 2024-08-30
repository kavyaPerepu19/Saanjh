import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getWeekNumber = () => {
  const currentDate = new Date();
  return currentDate;
};

const EditableForm = ({ selectedPatientId, initialData }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e, path) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };

    let nested = updatedFormData;
    for (let i = 0; i < path.length - 1; i++) {
      nested = nested[path[i]];
    }
    nested[path[path.length - 1]] = value;

    setFormData(updatedFormData);
  };

  const renderFields = (data, path = []) => {
    return Object.keys(data).map((key) => {
      const value = data[key];
      const currentPath = [...path, key];

      if (typeof value === 'object' && value !== null) {
        return (
          <section key={key} style={styles.section}>
            <h3 style={styles.sectionTitle}>{key}</h3>
            {renderFields(value, currentPath)}
          </section>
        );
      } else {
        return (
          <div key={key} style={styles.listItem}>
            <strong style={styles.listItemKey}>{key}:</strong>
            {isEditing ? (
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) => handleInputChange(e, currentPath)}
                style={styles.input}
              />
            ) : (
              <span>{value}</span>
            )}
          </div>
        );
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const weekNumber = getWeekNumber();
      const dataToSave = { ...formData, userId: selectedPatientId, date: weekNumber };
      const response = await axios.post('http://localhost:8080/api/submit', dataToSave);
      toast.success('Report submitted successfully!');
      console.log('Save response:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error submitting report. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:8080/save', formData);
      toast.success('Report saved successfully!');
      console.log('Save response:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving report. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Report Details</h2>
      </div>

      <div>
        {renderFields(formData)}

        <div style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <button type="button" style={styles.button} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="button" style={styles.button} onClick={handleSave}>
                Save
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <button type="submit" style={styles.button}>
                Submit
              </button>
              <button type="button" style={styles.button} onClick={() => setIsEditing(true)}>
                Edit
              </button>
            </form>
          )}
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f9fafb',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    width: '100%',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#2c3e50',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  section: {
    marginBottom: '1.5rem',
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #4a90e2',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '0.5rem',
    color: '#34495e',
  },
  listItem: {
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  listItemKey: {
    color: '#2c3e50',
    fontWeight: '600',
    marginRight: '0.5rem',
  },
  input: {
    width: '100%',
    backgroundColor: '#f9fafb',
    color: '#2c3e50',
    fontWeight: '600',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #e5e7eb',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
  },
  button: {
    backgroundColor: '#4a90e2',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
    border: 'none',
  },
  form: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

export default EditableForm;
