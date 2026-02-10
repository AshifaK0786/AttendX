import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

const MarkAttendanceScreen = () => {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState('Present');
  const [inTime, setInTime] = useState('09:00');
  const [outTime, setOutTime] = useState('18:00');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('📥 Fetching employees...');
      const response = await api.get('/admin/employees');
      const employeeList = Array.isArray(response) ? response : [];
      setEmployees(employeeList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];

    try {
      setSubmitting(true);
      await api.post('/admin/attendance', {
        employee_id: selectedEmployee,
        date: dateStr,
        status,
        in_time: inTime,
        out_time: outTime,
      });

      Alert.alert('Success', 'Attendance marked successfully');
      setSelectedEmployee('');
      setStatus('Present');
      setInTime('09:00');
      setOutTime('18:00');
      setSelectedDate(new Date());
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.name} (${emp.employee_id})`,
    value: emp.employee_id,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Mark Attendance</Text>
        <Text style={styles.headerSubtitle}>Manually record employee attendance</Text>
      </View>

      <View style={styles.form}>
        {/* Employee Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Employee *</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={setSelectedEmployee}
              items={employeeOptions}
              value={selectedEmployee}
              placeholder={{ label: 'Choose an employee...', value: '' }}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {selectedDate.toISOString().split('T')[0]}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Status Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Attendance Status *</Text>
          <View style={styles.statusButtons}>
            {['Present', 'Absent', 'Late', 'Half Day'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusButton,
                  status === s && styles.statusButtonActive,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === s && styles.statusButtonTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* In Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Check-In Time</Text>
          <Text style={styles.timeInput}>{inTime}</Text>
        </View>

        {/* Out Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Check-Out Time</Text>
          <Text style={styles.timeInput}>{outTime}</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleMarkAttendance}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>✓ Mark Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#1a1a1a',
    backgroundColor: '#f9f9f9',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#1a1a1a',
    backgroundColor: '#f9f9f9',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  form: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  statusButtonActive: {
    borderColor: '#1a73e8',
    backgroundColor: '#e3f2fd',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#1a73e8',
  },
  timeInput: {
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    color: '#1a1a1a',
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MarkAttendanceScreen;
