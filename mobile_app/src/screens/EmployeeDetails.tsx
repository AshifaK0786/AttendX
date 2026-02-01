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

  const [status, setStatus] = useState(record.status);
  const [inTime, setInTime] = useState(record.in_time);
  const [outTime, setOutTime] = useState(record.out_time);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await api.put(`/admin/attendance/${record._id}`, {
        status,
        in_time: inTime,
        out_time: outTime,
      });
      Alert.alert('Success', 'Attendance record updated successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['Present', 'Absent', 'Late', 'Half Day'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Attendance</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.employeeCard}>
          <Text style={styles.avatarEmoji}>👷</Text>
          <View>
            <Text style={styles.employeeName}>{record.name}</Text>
            <Text style={styles.employeeId}>Employee ID: {record.employee_id}</Text>
            <Text style={styles.recordDate}>Date: {record.date}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {statuses.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  status === s && styles.selectedStatus,
                  { borderColor: getStatusColor(s) }
                ]}
                onPress={() => setStatus(s)}
              >
                <Text style={[
                  styles.statusOptionText,
                  status === s && styles.selectedStatusText
                ]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>In Time</Text>
          <TextInput
            style={styles.input}
            value={inTime}
            onChangeText={setInTime}
            placeholder="e.g. 09:00 AM"
          />

          <Text style={styles.label}>Out Time</Text>
          <TextInput
            style={styles.input}
            value={outTime}
            onChangeText={setOutTime}
            placeholder="e.g. 06:00 PM"
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present': return '#4caf50';
    case 'Absent': return '#f44336';
    case 'Late': return '#ff9800';
    case 'Half Day': return '#ffc107';
    default: return '#999';
  }
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
    overflow: 'hidden',
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
  recordDate: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedStatus: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectedStatusText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeeDetails;
