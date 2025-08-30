import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authSignIn, authSignUp, setAuthToken } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize from localStorage
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (token && storedUser) {
      try {
        setAuthToken(token);
        setUser(JSON.parse(storedUser));
      } catch (_) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password, role) => {
    try {
      const result = await authSignIn({ phone, password, role });
      if (result?.token && result?.user) {
        setUser(result.user);
        setAuthToken(result.token);
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('authUser', JSON.stringify(result.user));
        toast.success('Login successful!');
        
        // Redirect based on role
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'worker':
            navigate('/worker/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
        return { success: true };
      } else {
        const msg = result?.error || 'Invalid credentials';
        toast.error(msg);
        return { success: false, error: msg };
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const { phone, name, email, password, role, adminSecret } = userData;
      const result = await authSignUp({ phone, name, email, password, role, adminSecret });
      if (result?.token && result?.user) {
        setUser(result.user);
        setAuthToken(result.token);
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('authUser', JSON.stringify(result.user));
        toast.success('Registration successful!');
        // Redirect based on role
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'worker':
            navigate('/worker/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
        return { success: true };
      } else {
        const msg = result?.error || 'Registration failed';
        toast.error(msg);
        return { success: false, error: msg };
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
