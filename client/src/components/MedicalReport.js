import React from 'react';
import { FaUser, FaVial, FaMicroscope } from 'react-icons/fa';

const iconMap = {
  "Patient Details": <FaUser />,
  CBC: <FaVial />,
  "Peripheral Blood Smear": <FaMicroscope />,
  // Add more mappings as necessary
};

const MedicalReport = ({ data }) => {
  console.log("HIIII THIS IS", data);

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
      cursor: 'pointer',
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
      display: 'flex',
      alignItems: 'center',
      fontSize: '1.25rem',
      fontWeight: '600',
      borderBottom: '2px solid #ecf0f1',
      paddingBottom: '0.5rem',
      color: '#34495e',
    },
    sectionIcon: {
      marginRight: '0.5rem',
      color: '#4a90e2',
    },
    list: {
      paddingLeft: '1rem',
      color: '#7f8c8d',
      listStyleType: 'none',
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Medical Report</h2>
      </div>
      {Object.entries(data).map(([sectionKey, sectionValue]) => (
        <section key={sectionKey} style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {iconMap[sectionKey] || <FaUser style={styles.sectionIcon} />} {sectionKey}
          </h3>
          <ul style={styles.list}>
            {typeof sectionValue === 'object' ? (
              Object.entries(sectionValue).map(([key, value]) => (
                <li key={key} style={styles.listItem}>
                  <strong style={styles.listItemKey}>{key}:</strong> {value}
                </li>
              ))
            ) : (
              <li style={styles.listItem}>
                <strong style={styles.listItemKey}>{sectionKey}:</strong> {sectionValue}
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default MedicalReport;
