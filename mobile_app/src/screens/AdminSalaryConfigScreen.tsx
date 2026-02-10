import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';

const AdminSalaryConfigScreen = () => {
  const route = useRoute();
  const { employee } = route.params as { employee: any };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    overtimeRate: '',
    bonus: '',
    penalties: '',
    advanceDeduction: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.overtimeRate || !formData.bonus || !formData.penalties || !formData.advanceDeduction) {
        Alert.alert('Validation Error', 'Please fill in all fields');
        return;
      }

      setSubmitting(true);
      const payload = {
        overtimeRate: parseFloat(formData.overtimeRate),
        bonus: parseFloat(formData.bonus),
        penalties: parseFloat(formData.penalties),
        advanceDeduction: parseFloat(formData.advanceDeduction),
      };

      await api.post(`/admin/salary/configure/${employee.employee_id}`, payload);

      Alert.alert('Success', 'Salary configuration updated successfully');
      setFormData({
        overtimeRate: '',
        bonus: '',
        penalties: '',
        advanceDeduction: '',
      });
    } catch (error: any) {
      console.error('Error configuring salary:', error);
      Alert.alert('Error', error?.message || 'Failed to update salary configuration');
    } finally {
      setSubmitting(false);
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
          <Text style={styles.headerTitle}>💰 Configure Salary</Text>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeId}>ID: {employee.employee_id}</Text>
        </View>

        {/* Base Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Base Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Salary Per Day:</Text>
            <Text style={styles.infoValue}>₹{employee.salaryPerDay}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>{employee.role}</Text>
          </View>
        </View>

        {/* Salary Configuration Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Salary Components</Text>

          {/* Overtime Rate */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Overtime Rate (₹/hour)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              keyboardType="decimal-pad"
              value={formData.overtimeRate}
              onChangeText={(text) => handleInputChange('overtimeRate', text)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>
              Hourly rate for overtime hours worked beyond regular shift
            </Text>
          </View>

          {/* Bonus */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Monthly Bonus (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1000"
              keyboardType="decimal-pad"
              value={formData.bonus}
              onChangeText={(text) => handleInputChange('bonus', text)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>
              Any performance bonus or incentive for this month
            </Text>
          </View>

          {/* Penalties */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Penalties (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              keyboardType="decimal-pad"
              value={formData.penalties}
              onChangeText={(text) => handleInputChange('penalties', text)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>
              Deductions for late arrivals, conduct issues, etc.
            </Text>
          </View>

          {/* Advance Deduction */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Advance Deduction (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2000"
              keyboardType="decimal-pad"
              value={formData.advanceDeduction}
              onChangeText={(text) => handleInputChange('advanceDeduction', text)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>
              Any salary advance provided to employee (will be deducted from salary)
            </Text>
          </View>
        </View>

        {/* Formula Information */}
        <View style={[styles.card, { backgroundColor: '#f0f0f0' }]}>
          <Text style={styles.cardTitle}>📐 Salary Calculation Formula</Text>
          <Text style={styles.formulaText}>
            Gross = (Present Days × Salary/Day) + (Half Days × 0.5 × Salary/Day) + (Overtime Hours × Rate)
          </Text>
          <Text style={styles.formulaText}>
            Net = Gross + Bonus - Insurance - Penalties - Advance
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>✓ Save Configuration</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#34a853',
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  employeeName: {
    fontSize: 18,
    color: '#e8f5e9',
    fontWeight: '600',
  },
  employeeId: {
    fontSize: 14,
    color: '#c8e6c9',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 6,
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  formulaText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  submitButton: {
    backgroundColor: '#34a853',
    marginHorizontal: 15,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  spacing: {
    height: 30,
  },
});

export default AdminSalaryConfigScreen;
