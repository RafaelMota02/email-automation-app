import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from './AuthContext';
import { API_BASE_URL } from '../config';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      setAuthLoading(true);
      
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data); // Verify endpoint returns user object directly
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setUser(null); // Ensure user state is cleared on verification failure
        }
      }
      setAuthLoading(false);
    };
    
    verifyAuth();
  }, []);

const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, {
      headers: {'Content-Type': 'application/json'}
    });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      throw new Error(message);
    }
  };

  const signup = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, { email, password }, {
        headers: {'Content-Type': 'application/json'}
      });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed. Please try again.';
      throw new Error(message);
    }
  };

const logout = useCallback(() => {
  localStorage.removeItem('token');
  setUser(null);
  navigate('/login');
}, [navigate]);

  return (
    <AuthContext.Provider value={{ user, authLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
