import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { 
  getToken, 
  setToken, 
  removeToken, 
  getRefreshToken, 
  setRefreshToken, 
  removeRefreshToken 
} from '../utils/tokenUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await api.get('/users/me');
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          try {
            await refreshTokenSilently();
          } catch (refreshError) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const refreshTokenSilently = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      const response = await api.get('/users/refresh', {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      
      const { access_token } = response.data;
      setToken(access_token);
      
      const userResponse = await api.get('/users/me');
      setCurrentUser(userResponse.data);
      
      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      
      const { access_token, refresh_token } = response.data;
      
      setToken(access_token);
      setRefreshToken(refresh_token);
      
      const userResponse = await api.get('/users/me');
      setCurrentUser(userResponse.data);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    removeRefreshToken();
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    refreshToken: refreshTokenSilently
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;