import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const EmployeeDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { record } = route.params as { record: any };

  const [loading, setLoading] = useState(false);

  const handleConfigueSalary = () => {
    navigation.navigate('AdminSalaryConfig' as any, { employee: record });
  };

  const handleAssignInsurance = () => {
    navigation.navigate('AdminInsuranceAssign' as any, { employee: record });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Employee Card */}
        <View style={styles.employeeCard}>
          <Text style={styles.avatarEmoji}>👷</Text>
          <View>
            <Text style={styles.employeeName}>{record.name}</Text>
            <Text style={styles.employeeId}>ID: {record.employee_id}</Text>
            <Text style={styles.employeeRole}>{record.role}</Text>
          </View>
        </View>

        {/* Employee Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📋 Employee Information</Text>
          <View style={[styles.infoCard, { gap: 15 }]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employee ID:</Text>
              <Text style={styles.infoValue}>{record.employee_id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{record.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{record.role}</Text>
            </View>
            {record.salaryPerDay !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Salary/Day:</Text>
                <Text style={styles.infoValue}>₹{record.salaryPerDay}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚙️ Administrative Actions</Text>

          {/* Salary Configuration Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.salaryCard]}
            onPress={handleConfigueSalary}
          >
            <View style={styles.actionCardContent}>
              <Text style={styles.actionIcon}>💰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Configure Salary</Text>
                <Text style={styles.actionDescription}>
                  Set overtime rate, bonus, penalties, advance
                </Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {/* Insurance Assignment Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.insuranceCard]}
            onPress={handleAssignInsurance}
          >
            <View style={styles.actionCardContent}>
              <Text style={styles.actionIcon}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Assign Insurance</Text>
                <Text style={styles.actionDescription}>
                  Assign LIC or health insurance policy
                </Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {/* View Attendance Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.attendanceCard]}
            onPress={() => Alert.alert('Coming Soon', 'View attendance records for this employee')}
          >
            <View style={styles.actionCardContent}>
              <Text style={styles.actionIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>View Attendance</Text>
                <Text style={styles.actionDescription}>
                  Check attendance records and statistics
                </Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>ℹ️ Quick Tips</Text>
          <Text style={styles.infoBoxText}>
            • Configure salary details before calculating monthly salaries
          </Text>
          <Text style={styles.infoBoxText}>
            • Insurance premiums are deducted from the net salary
          </Text>
          <Text style={styles.infoBoxText}>
            • Changes take effect from the next salary calculation
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    padding: 20,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 40,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 30,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  employeeRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionsSection: {
    marginBottom: 25,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  salaryCard: {
    borderLeftColor: '#34a853',
  },
  insuranceCard: {
    borderLeftColor: '#ff6b6b',
  },
  attendanceCard: {
    borderLeftColor: '#2196F3',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 18,
    color: '#999',
  },
  infoBox: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bbdefb',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#1565c0',
    lineHeight: 18,
    marginBottom: 5,
  },
});

export default EmployeeDetails;
