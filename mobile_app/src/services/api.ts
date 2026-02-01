import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to access localhost
// For iOS simulator, use localhost or your machine IP
// For physical device, use your machine's IP address
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_URL);
console.log('📱 Platform:', Platform.OS);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response Success:', response.status, response.statusText);
    console.log('📋 Response data:', response.data);
    return response.data;
  },
  async (error) => {
    console.error('🔴 API Error occurred');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    
    if (error.response?.status === 401) {
      // Clear stored auth data if token is invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    // Return the error in a structured way
    const errorData = error.response?.data || {
      error: error.message || 'Network error',
      message: error.message || 'Failed to connect to server'
    };
    
    console.error('Final error object:', errorData);
    return Promise.reject(errorData);
  }
);

export default api;
