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
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

const AdminInsuranceAssignScreen = () => {
  const route = useRoute();
  const { employee } = route.params as { employee: any };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    policyName: '',
    policyNumber: '',
    premiumAmount: '',
    coverageAmount: '',
    policyStartDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    providerName: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const policyOptions = [
    { label: 'LIC (Life Insurance)', value: 'LIC Life Insurance' },
    { label: 'Health Insurance', value: 'Health Insurance' },
    { label: 'Accident Insurance', value: 'Accident Insurance' },
    { label: 'Critical Illness', value: 'Critical Illness' },
    { label: 'Group Insurance', value: 'Group Insurance' },
  ];

  const providerOptions = [
    { label: 'Life Insurance Corporation (LIC)', value: 'LIC' },
    { label: 'HDFC Life', value: 'HDFC Life' },
    { label: 'ICICI Prudential', value: 'ICICI Prudential' },
    { label: 'Bajaj Allianz', value: 'Bajaj Allianz' },
    { label: 'Max Life', value: 'Max Life' },
    { label: 'Other', value: 'Other' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Expired', value: 'Expired' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      handleInputChange('policyStartDate', dateString);
    }
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.policyName ||
        !formData.policyNumber ||
        !formData.premiumAmount ||
        !formData.coverageAmount
      ) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }

      setSubmitting(true);
      const payload = {
        employee_id: employee.employee_id,
        policyName: formData.policyName,
        policyNumber: formData.policyNumber,
        premiumAmount: parseFloat(formData.premiumAmount),
        coverageAmount: parseFloat(formData.coverageAmount),
        policyStartDate: formData.policyStartDate,
        status: formData.status,
        providerName: formData.providerName,
      };

      await api.post('/lic-policy', payload);

      Alert.alert('Success', 'Insurance policy assigned successfully');
      setFormData({
        policyName: '',
        policyNumber: '',
        premiumAmount: '',
        coverageAmount: '',
        policyStartDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        providerName: '',
      });
    } catch (error: any) {
      console.error('Error assigning insurance:', error);
      Alert.alert('Error', error?.message || 'Failed to assign insurance policy');
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
          <Text style={styles.headerTitle}>🛡️ Assign Insurance</Text>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeId}>ID: {employee.employee_id}</Text>
        </View>

        {/* Base Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Employee Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{employee.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>{employee.role}</Text>
          </View>
        </View>

        {/* Insurance Configuration Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Policy Details</Text>

          {/* Policy Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Policy Name *</Text>
            <RNPickerSelect
              onValueChange={(value) => handleInputChange('policyName', value)}
              items={policyOptions}
              value={formData.policyName}
              placeholder={{ label: 'Select policy type...', value: '' }}
              style={pickerSelectStyles}
            />
          </View>

          {/* Policy Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Policy Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., POL123456789"
              value={formData.policyNumber}
              onChangeText={(text) => handleInputChange('policyNumber', text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Premium Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Monthly Premium (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              keyboardType="decimal-pad"
              value={formData.premiumAmount}
              onChangeText={(text) => handleInputChange('premiumAmount', text)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>
              Amount to be deducted from salary every month
            </Text>
          </View>

          {/* Coverage Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Coverage Amount (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500000"
              keyboardType="decimal-pad"
              value={formData.coverageAmount}
              onChangeText={(text) => handleInputChange('coverageAmount', text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Policy Start Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateInputText}>
                {formData.policyStartDate}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.policyStartDate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Provider Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Provider Name</Text>
            <RNPickerSelect
              onValueChange={(value) => handleInputChange('providerName', value)}
              items={providerOptions}
              value={formData.providerName}
              placeholder={{ label: 'Select provider...', value: '' }}
              style={pickerSelectStyles}
            />
          </View>

          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Policy Status</Text>
            <RNPickerSelect
              onValueChange={(value) => handleInputChange('status', value)}
              items={statusOptions}
              value={formData.status}
              placeholder={{ label: 'Select status...', value: '' }}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        {/* Important Notes */}
        <View style={[styles.card, { backgroundColor: '#fff3e0' }]}>
          <Text style={styles.cardTitle}>ℹ️ Important Notes</Text>
          <Text style={styles.noteText}>
            • Premium amount will be automatically deducted from employee's monthly salary
          </Text>
          <Text style={styles.noteText}>
            • Policy number must be unique and match provider records
          </Text>
          <Text style={styles.noteText}>
            • Coverage amount reflects the maximum benefit that can be claimed
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
            <Text style={styles.submitButtonText}>✓ Assign Insurance</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#1a1a1a',
    paddingRight: 30,
    backgroundColor: '#fafafa',
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#1a1a1a',
    paddingRight: 30,
    backgroundColor: '#fafafa',
  },
  placeholder: {
    color: '#999',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6b6b',
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
    color: '#ffcccc',
    fontWeight: '600',
  },
  employeeId: {
    fontSize: 14,
    color: '#ffaaaa',
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
    backgroundColor: '#fafafa',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 20,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#ff6b6b',
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

export default AdminInsuranceAssignScreen;
