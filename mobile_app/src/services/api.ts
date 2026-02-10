import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your machine's IP address for physical device/Expo Go
const API_URL = 'http://192.168.43.145:5000/api';

let authToken: string | null = null;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Set token from AuthContext (called after login)
export const setAuthToken = (token: string | null) => {
  authToken = token;
  console.log('🔐 API auth token updated:', !!token);
};

// Add token to requests - use module-level token to avoid AsyncStorage race condition
api.interceptors.request.use(
  (config) => {
    console.log('📡 Request to', config.url, '- Token present:', !!authToken);
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('⚠️ No token available');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      authToken = null;
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    const errorData = error.response?.data || {
      error: error.message || 'Network error',
      message: error.message || 'Failed to connect to server'
    };
    
    return Promise.reject(errorData);
  }
);

export default api;
