import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';

interface User {
  id: string;
  employee_id: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login(employee_id: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageUser = await AsyncStorage.getItem('user');
        const storageToken = await AsyncStorage.getItem('token');

        if (storageUser && storageToken) {
          setUser(JSON.parse(storageUser));
          setToken(storageToken);
          setAuthToken(storageToken);
          console.log('✅ Auth data loaded from storage, token set in API');
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const login = async (employee_id: string, password: string) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await authService.login(employee_id, password);
      console.log('📦 Login response:', response);
      
      const { user: userData, token: authToken } = response;
      console.log('👤 User data:', userData);
      console.log('🔑 Auth token:', authToken ? 'present' : 'missing');

      setUser(userData);
      setToken(authToken);
      setAuthToken(authToken);
      console.log('🔐 Token set in API interceptor');

      console.log('💾 Storing to AsyncStorage...');
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);
      console.log('✅ Auth data stored successfully');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const message = error?.message || error?.error || 'Login failed. Please try again.';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      setAuthToken(null);
      console.log('🔐 Token cleared from API interceptor');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setToken(null);
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
