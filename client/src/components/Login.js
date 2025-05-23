import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = ({ setIsLoggedIn }) => {
  const [formObj, setFormObj] = useState({ username: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorLoggingIn, setErrorLoggingIn] = useState('');
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setFormObj({ ...formObj, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formObj);

    try {
      const resp = await axios.post('http://localhost:8000/api/login', { ...formObj });
      
      console.log(resp);
      if (resp.data.success) {
        setLoggedIn(true);
        setErrorLoggingIn('');
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userType', resp.data.user.userType); // Store userType
        setIsLoggedIn(true);
        console.log("Successfully logged in");
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setLoggedIn(false);
        setErrorLoggingIn("Invalid username or password");
      }
    } catch (error) {
      console.log("Error while logging in");
      console.log(error);
      setLoggedIn(false);
      setErrorLoggingIn("Error while logging in");
    }
  };

  const Error = () => (
    <div className="alert alert-danger" role="alert">
      {errorLoggingIn}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <img src="https://thyro-aid.vercel.app/static/media/login.7a8c2a7225fdec8c6f23.png" alt="Login" className="w-full h-full object-cover" />
      </div>
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg" style={{ background: 'rgba(136, 210, 216, 0.5)' }}>
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            {errorLoggingIn && <Error />}
            <div className="mb-4">
              <label htmlFor="username" className="form-label text-gray-600">Username</label>
              <input
                type="text"
                className="form-control form-control-sm border border-gray-300 rounded-xl py-2 px-3 w-full"
                id="username"
                name="username"
                value={formObj.username}
                onChange={changeHandler}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label text-gray-600">Password</label>
              <input
                type="password"
                className="form-control form-control-sm border border-gray-300 rounded py-2 px-3 w-full"
                id="password"
                name="password"
                value={formObj.password}
                onChange={changeHandler}
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded w-full" style={{ background: 'black' }}>
              Submit
            </button>
          </form>
          {loggedIn && <div className="alert alert-success mt-4 text-center">Successfully logged in! Redirecting to home...</div>}
        </div>
      </div>
    </div>
  );
};

export default Login;
