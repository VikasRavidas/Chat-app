import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthState, startSignup, signup } from '../actions/auth';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, inProgress, isLoggedin } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedin) {
      navigate('/'); // ✅ Redirect to home after signup
    }
  }, [isLoggedin, navigate]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (name && email && password && confirmPassword) {
      dispatch(startSignup());
      dispatch(signup(name, email, password, confirmPassword));
    }
  };

  return (
    <form className="login-form">
      <span className="login-signup-header">Sign Up</span>
      {error && <div className="alert error-dialog">{error}</div>}
      <div className="field">
        <input
          type="text"
          placeholder="Name"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </div>
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
        <input
          type="password"
          placeholder="Confirm Password"
          required
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
        />
      </div>
      <div className="field">
        <button onClick={handleFormSubmit} disabled={inProgress}>
          {inProgress ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
};

export default Signup;
