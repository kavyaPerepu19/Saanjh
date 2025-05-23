import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const [formObj, setFormObj] = useState({ username: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorLoggingIn, setErrorLoggingIn] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NEW
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setFormObj({ ...formObj, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loader
    setErrorLoggingIn('');

    try {
      const resp = await axios.post('http://localhost:8000/api/login', { ...formObj });
      if (resp.data.success) {
        setLoggedIn(true);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userType', resp.data.user.userType);
        setIsLoggedIn(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setLoggedIn(false);
        setErrorLoggingIn("Invalid username or password");
      }
    } catch (error) {
      console.error("Error while logging in", error);
      setLoggedIn(false);
      setErrorLoggingIn("Error while logging in");
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const Error = () => (
    <div className="alert alert-danger" role="alert">
      {errorLoggingIn}
    </div>
  );

  const Loader = () => (
    <div className="flex justify-center my-4">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white font-semibold py-2 px-4 rounded w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Submit'}
            </button>
            {isLoading && <Loader />}
          </form>
          {loggedIn && <div className="alert alert-success mt-4 text-center">Successfully logged in! Redirecting to home...</div>}
        </div>
      </div>
    </div>
  );
};

export default Login;
