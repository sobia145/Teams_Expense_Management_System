import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import './LoginPage.css';

const SignUpPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await userService.register({
        name: form.name,
        email: form.email,
        password: form.password
      });

      navigate('/login');
    } catch (err) {
      console.error(err);
      // EXTRACT SPECIFIC BACKEND MESSAGE: Showing real feedback for duplicate emails, etc.
      const data = err.response?.data;
      if (data && data.message) {
        setError(data.message);
      } else {
        setError("Registration Failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      {/* 🚀 Left Pane: Visual Asset Container */}
      <div className="login-graphic-pane">
        <div className="login-graphic-text">
          <h2>Welcome to TEMS</h2>
          <p>Join TEMS to manage your team expenses and track your financial growth with ease.</p>
        </div>
        <img src="/login_graphic.png" alt="Fintech Administration" />
      </div>

      {/* 🔐 Right Pane: Secure API Logic Container */}
      <div className="login-form-pane">
        <div style={{width: '100%', maxWidth: '450px'}}>
          <div className="logo">
            <div style={{background: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>⚡</div>
            TEMS
          </div>

          <h3>Create Account</h3>
          <p className="subtitle">Join TEMS to manage your team expenses</p>

          {error && <div className="error-message" style={{marginBottom: '20px'}}>{error}</div>}

          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="input-wrap">
              <label>Full Name</label>
              <input 
                name="name"
                type="text" 
                placeholder="Full Name" 
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-wrap">
              <label>Email</label>
              <input 
                name="email"
                type="email" 
                placeholder="Email" 
                value={form.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="input-wrap">
              <label>Password</label>
              <input 
                name="password"
                type="password" 
                placeholder="Password" 
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="input-wrap">
              <label>Confirm Password</label>
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="Confirm Password" 
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-auth-button" disabled={loading} style={{ background: '#6366f1' }}>
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer" style={{marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--slate-500)'}}>
            Already have an account? <Link to="/login" style={{color: '#3b82f6', fontWeight: '600'}}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
