import React, { useState } from 'react';

const Admin = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/addpatient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age, gender }),
      });

      const responseData = await response.json();
      if (response.ok) {
        setNotification({ message: 'Patient added successfully!', type: 'success' });
        setUserId(responseData.userId); // assuming response contains userId
        // Optionally, clear the form or redirect after successful registration
        setName('');
        setAge('');
        setGender('');
      } else {
        setNotification({ message: `Failed to add patient: ${responseData.error}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      setNotification({ message: 'Error adding patient. Please try again.', type: 'error' });
    }
  };

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
    overflowY: 'auto',
  };

  const contentStyle = {
    zIndex: 1,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: 'rgba(220, 220, 220, 0.76)',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    overflowY: 'auto',
  };

  const styles = {
    formGroup: {
      marginBottom: '1rem',
    },
    formLabel: {
      marginBottom: '.5rem',
      display: 'block',
    },
    formControl: {
      width: '100%',
      padding: '.5rem',
      borderRadius: '4px',
      border: '1px solid #ced4da',
    },
    button: {
      width: '100%',
      padding: '.75rem',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    h2: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    notification: {
      padding: '1rem',
      borderRadius: '4px',
      marginBottom: '1rem',
    },
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
    },
  };

  return (
    <div style={backgroundStyle}>
      <div style={blurOverlayStyle}></div>
      <div style={contentStyle}>
        <h2 style={styles.h2}>Admin Register</h2>
        {notification.message && (
          <div style={{ ...styles.notification, ...(notification.type === 'success' ? styles.success : styles.error) }}>
            {notification.message}
          </div>
        )}
        {userId && (
          <div style={{ ...styles.notification, ...styles.success }}>
            User ID: {userId}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel} htmlFor="formName">Name</label>
            <input
              className='text-dark'
              id="formName"
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.formControl}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel} htmlFor="formAge">Age</label>
            <input
              className='text-dark'
              id="formAge"
              type="number"
              placeholder="Enter age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              style={styles.formControl}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel} htmlFor="formGender">Gender</label>
            <input
              className='text-dark'
              id="formGender"
              type="text"
              placeholder="Enter gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              style={styles.formControl}
            />
          </div>
          <button type="submit" style={styles.button}>Add Patient</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
