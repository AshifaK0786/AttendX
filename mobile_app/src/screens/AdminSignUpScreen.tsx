import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  AdminSignUp: undefined;
  EmployeeSignUp: undefined;
};

export default function AdminSignUpScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    } else if (formData.employee_id.trim().length < 3) {
      newErrors.employee_id = 'Employee ID must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('🔵 Sending admin signup request...');

      // Register the admin account; if it fails, show the error and stop
      await authService.register({
        employee_id: formData.employee_id.trim(),
        name: formData.name.trim(),
        password: formData.password,
        role: 'admin',
      });
      console.log('✅ Admin signup successful');

      // Now log the user in and navigate to admin dashboard
      await login(formData.employee_id.trim(), formData.password);
      console.log('✅ Auto-login complete, navigating to admin dashboard...');
      navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' as any }] });

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const message = error?.message || error?.error || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Sign Up</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👨‍💼</Text>
            <Text style={styles.roleTitle}>Administrator Account</Text>
            <Text style={styles.roleDescription}>
              Manage attendance, employees, and upload records
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Employee ID */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Employee ID</Text>
              <TextInput
                style={[styles.input, errors.employee_id && styles.inputError]}
                placeholder="e.g., ADM001"
                placeholderTextColor="#999"
                value={formData.employee_id}
                onChangeText={(text) =>
                  setFormData({ ...formData, employee_id: text })
                }
                editable={!loading}
              />
              {errors.employee_id && (
                <Text style={styles.errorText}>{errors.employee_id}</Text>
              )}
            </View>

            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Your full name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!loading}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                editable={!loading}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm password"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                editable={!loading}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Admins can upload attendance sheets, manage employees, and view all records
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Admin Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.footerText}>
              <Text style={styles.footerLabel}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Home */}
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.backToHome}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 64,
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#0d47a1',
    flex: 1,
  },
  signUpButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  footerLabel: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
  },
  backToHome: {
    textAlign: 'center',
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
  },
});
