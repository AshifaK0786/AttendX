import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      // Get employee count and sample data from public endpoint
      const response = await api.get('/admin/employees/public');
      const employeeList = Array.isArray(response) ? response : response.data || [];
      
      setEmployeeCount(employeeList.length);
      // Show only first 6 employees or fewer
      setEmployees(employeeList.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // Show placeholder dummy data if no data yet
      setEmployees([
        { _id: '1', name: 'John Doe', employee_id: 'EMP001' },
        { _id: '2', name: 'Jane Smith', employee_id: 'EMP002' },
        { _id: '3', name: 'Mike Johnson', employee_id: 'EMP003' },
        { _id: '4', name: 'Sarah Wilson', employee_id: 'EMP004' },
        { _id: '5', name: 'Robert Brown', employee_id: 'EMP005' },
        { _id: '6', name: 'Emily Davis', employee_id: 'EMP006' },
      ]);
      setEmployeeCount(12);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>🏭 AttendX</Text>
        <Text style={styles.tagline}>Smart Attendance Management Solutions</Text>
      </View>

      {/* Workshop Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Welcome to AttendX</Text>
        <View style={styles.workshopContent}>
          <Text style={styles.workshopIcon}>⚙️</Text>
          <Text style={styles.workshopName}>Premium Industrial Mechanical Services</Text>
        </View>
        <Text style={styles.description}>
          AttendX is a leading platform specializing in precision manufacturing, heavy machinery maintenance, and industrial solutions. Equipped with state-of-the-art machinery and staffed by highly skilled professionals dedicated to delivering excellence in every project.
        </Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{employeeCount > 0 ? employeeCount : '1000+'}</Text>
            <Text style={styles.statLabel}>{employeeCount > 0 ? 'Employees' : 'Capacity'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Operations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Quality</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutCard}>
        <Text style={styles.sectionTitle}>About AttendX</Text>
        <Text style={styles.aboutText}>
          AttendX is equipped with advanced machinery for fabrication, welding, CNC machining, and assembly operations. Our team of experienced technicians handles projects ranging from small precision components to large industrial equipment maintenance. We maintain strict quality standards and on-time delivery for all clients.
        </Text>
      </View>

      {/* Team Section */}
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Meet Our Skilled Team</Text>
        <Text style={styles.teamSubtitle}>
          {employeeCount > 0 
            ? `Showing ${Math.min(6, employeeCount)} of ${employeeCount} registered employees` 
            : 'Register employees to see the team'}
        </Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.loadingText}>Loading employee data...</Text>
          </View>
        ) : employees.length > 0 ? (
          <View style={styles.employeeGrid}>
            {employees.map((employee, index) => (
              <View key={employee._id || index} style={styles.employeeCard}>
                <Text style={styles.employeeAvatar}>👷‍♂️</Text>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeeRole}>ID: {employee.employee_id}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>📋 No employees registered yet</Text>
            <Text style={styles.emptyStateSubtext}>Employees will appear here after signup</Text>
          </View>
        )}
      </View>

      {/* Features Section */}
      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚙️</Text>
          <View>
            <Text style={styles.featureTitle}>Modern Equipment</Text>
            <Text style={styles.featureDesc}>Latest technology and tools</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>👥</Text>
          <View>
            <Text style={styles.featureTitle}>Expert Team</Text>
            <Text style={styles.featureDesc}>Highly skilled professionals</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <View>
            <Text style={styles.featureTitle}>Transparent System</Text>
            <Text style={styles.featureDesc}>Real-time attendance tracking</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View>
            <Text style={styles.featureTitle}>Secure & Reliable</Text>
            <Text style={styles.featureDesc}>Enterprise-grade security</Text>
          </View>
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Get Started</Text>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminSignUp' as any)}
        >
          <Text style={styles.adminButtonText}>Admin Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.employeeButton}
          onPress={() => navigation.navigate('EmployeeSignUp' as any)}
        >
          <Text style={styles.employeeButtonText}>Employee Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login' as any)}
        >
          <Text style={styles.loginButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 AttendX</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#e8f0fe',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  workshopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  workshopIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  aboutCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  teamSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
  },
  employeeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  employeeCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  employeeAvatar: {
    fontSize: 40,
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  employeeRole: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#bbb',
  },
  featuresCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
  },
  ctaSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
  },
  adminButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  employeeButton: {
    backgroundColor: '#34a853',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  employeeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a73e8',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
