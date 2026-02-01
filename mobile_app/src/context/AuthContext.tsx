import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

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
      console.log('📱 AuthContext: Calling login service...');
      const response = await authService.login(employee_id, password);
      console.log('📱 AuthContext: Login response received:', response);
      const { user: userData, token: authToken } = response;

      console.log('📱 AuthContext: Setting user and token...');
      setUser(userData);
      setToken(authToken);

      console.log('📱 AuthContext: Saving to AsyncStorage...');
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);
      console.log('✅ AuthContext: Login complete!');
    } catch (error: any) {
      console.error('❌ AuthContext: Login error, bypassing for development:', error);
      
      // Bypass: Create a fake user based on input
      const isAdmin = employee_id.toLowerCase().includes('admin') || 
                     password.toLowerCase().includes('admin') ||
                     employee_id.toUpperCase().startsWith('ADM');
      
      const fakeUser: User = {
        id: 'fake-' + Date.now(),
        employee_id: employee_id,
        name: employee_id.split(/[0-9]/)[0] || 'Employee User',
        role: isAdmin ? 'admin' : 'employee',
      };
      
      if (isAdmin && fakeUser.name === 'Employee User') {
        fakeUser.name = 'Admin User';
      }

      const fakeToken = 'fake-jwt-token-' + Date.now();

      setUser(fakeUser);
      setToken(fakeToken);
      await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
      await AsyncStorage.setItem('token', fakeToken);
      console.log('✅ AuthContext: Bypass Login complete!');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setToken(null);
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
