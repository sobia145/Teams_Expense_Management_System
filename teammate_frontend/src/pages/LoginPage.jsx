import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hook into the Global Security State!
  const { login } = useAuth();
  
  // React Router hook for redirecting post-login
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    
    setLoading(true);
    try {
      // Calling our newly upgraded Global Provider instead of the discrete service!
      const user = await login(email, password);
      
      console.log("Secure Login Success! Global State Auth active:", user);
      
      // Route the user securely to the Dashboard View
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      // EXTRACT SPECIFIC BACKEND MESSAGE: Showing real feedback instead of generic status codes
      const data = err.response?.data;
      if (data && data.message) {
        setError(data.message);
      } else {
        setError("Login Failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 🚀 Left Pane: Visual Asset Container */}
      <div className="login-graphic-pane">
        <div className="login-graphic-text">
          <h2>Welcome to TEMS</h2>
          <p>Your trusted platform for seamless enterprise administration and secure expense tracking.</p>
        </div>
        <img src="/login_graphic.png" alt="Fintech Administration" />
      </div>

      {/* 🔐 Right Pane: Secure API Logic Container */}
      <div className="login-form-pane">
        <div className="logo">
          <div style={{background: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>⚡</div>
          TEMS
        </div>

        <h3>Login</h3>
        <p className="subtitle">Please login to continue to your account.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{color: '#10b981', background: '#dcfce7', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '15px'}}>{success}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-wrap">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="engineer@tems.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-wrap">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-options">
            <label><input type="checkbox" /> Keep me logged in</label>
            <a>Forgot Password?</a>
          </div>

          <button type="submit" className="primary-auth-button" disabled={loading}>
            {loading ? "Authenticating via Java..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
