import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${API_URL}/auth/profile`);
          if (res.data && res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || 'Invalid credentials',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      if (res.data && res.data.success) {
        const { token: userToken, user: newUser } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(newUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
    } catch (err) {
      console.error('Registration error:', err);
      const data = err.response?.data;
      let message = 'Registration failed';
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = Array.isArray(data.error) ? data.error.join(', ') : data.error;
      } else if (data?.errors && Array.isArray(data.errors)) {
        message = data.errors.map(e => e.message).join(', ');
      }
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateLanguages = async (nativeLanguage, learningLanguage) => {
    try {
      if (!user) return;
      const updatedUser = { ...user, nativeLanguage, learningLanguage };
      setUser(updatedUser);
      await axios.put(`${API_URL}/auth/profile`, { nativeLanguage, learningLanguage });
    } catch (err) {
      console.error('Error updating languages:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateLanguages,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
