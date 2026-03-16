import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    requestedRole: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        requestedRole: formData.requestedRole
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      if (!err.response) {
        setError('Server is offline. Registration cannot be processed right now.');
      } else {
        setError(err.response.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-sidebar">
          <h2>Looks like you're new here!</h2>
          <p>Sign up with your details to get started with your account</p>
          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="75" r="40" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
        </div>

        <div className="auth-main">
          {error && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#b91c1c', 
              padding: '12px', 
              borderRadius: '10px', 
              marginBottom: '20px', 
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '600',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div className="input-container">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="mobile">Mobile Number</label>
                <div className="input-container">
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    className="form-input"
                    placeholder="+1 234 567 890"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

             <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-container" style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '45px' }}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I am a:</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="requestedRole" 
                    value="CUSTOMER" 
                    checked={formData.requestedRole === 'CUSTOMER'} 
                    onChange={handleChange}
                  />
                  Customer
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="requestedRole" 
                    value="VENDOR" 
                    checked={formData.requestedRole === 'VENDOR'} 
                    onChange={handleChange}
                  />
                  Seller / Vendor
                </label>
              </div>
            </div>

            <button type="submit" className="auth-btn">
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 'auto' }}>
            <div className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
