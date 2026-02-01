import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import AdminSignUpScreen from './src/screens/AdminSignUpScreen';
import EmployeeSignUpScreen from './src/screens/EmployeeSignUpScreen';
import EmployeeDashboard from './src/screens/EmployeeDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import EmployeeDetails from './src/screens/EmployeeDetails';

const Stack = createStackNavigator();

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminSignUp"
              component={AdminSignUpScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EmployeeSignUp"
              component={EmployeeSignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : user.role === 'admin' ? (
          <>
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={{ title: 'Admin Dashboard', headerShown: false }}
            />
            <Stack.Screen
              name="EmployeeDetails"
              component={EmployeeDetails}
              options={{ title: 'Employee Details', headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen
            name="EmployeeDashboard"
            component={EmployeeDashboard}
            options={{ title: 'Employee Dashboard', headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
