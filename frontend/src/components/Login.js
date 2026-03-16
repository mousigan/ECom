import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      const user = response.data;
      
      // Using a dummy token for now as full JWT flow isn't implemented
      const mockToken = 'dummy-token-' + Date.now();
      login(mockToken, user);

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else if (user.role === 'PENDING_VENDOR') {
        alert("Verification Pending: Your vendor account is awaiting admin approval.");
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (!err.response) {
        setError('Server is offline. Please wait a moment and try again.');
      } else {
        setError(err.response.data?.message || 'Invalid email or password');
      }
    }
  };


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-sidebar">
          <h2>Login</h2>
          <p>Get access to your Orders, Wishlist and Recommendations</p>
          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
             <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 100L100 50L150 100H50Z" fill="white" fillOpacity="0.3" />
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

            <div className="form-group">
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn">Sign In</button>
          </form>

          <div style={{ marginTop: 'auto' }}>
            <div className="auth-switch">
              Don't have an account? <Link to="/signup">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
