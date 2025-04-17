import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthState, login } from '../actions/auth';

import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Get current location

  const { from } = location.state || { from: { pathname: '/' } }; // ✅ Get previous page

  const { error, inProgress, isLoggedin } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedin) {
      navigate(from.pathname); // ✅ Redirect to previous page after login
    }
  }, [isLoggedin, navigate, from]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(login(email, password));
    }
  };

  return (
    <form className="login-form">
      <span className="login-signup-header">Log In</span>
      {error && <div className="alert error-dialog">{error}</div>}
      <div className="field">
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </div>
      <div className="field">
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>
      <div className="field">
        <button onClick={handleFormSubmit} disabled={inProgress}>
          {inProgress ? 'Logging In...' : 'Log In'}
        </button>
      </div>
    </form>
  );
};

export default Login;
