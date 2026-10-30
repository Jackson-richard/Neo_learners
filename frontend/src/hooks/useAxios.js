import { useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const useAxios = () => {
  const { token, logout } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
    });

    // Request interceptor: Inject JWT Token
    instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Log out user on 401 status
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token, logout, API_URL]);

  return axiosInstance;
};
