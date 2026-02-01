import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
    }, [])
  );

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/attendance');
      setAttendance(response.data || []);
    } catch (error: any) {
      console.error('Fetch error, using default values:', error);
      // Default values for Admin
      setAttendance([
        { _id: '1', employee_id: 'EMP001', name: 'John Doe', date: '2025-05-05', status: 'Present', in_time: '08:55 AM', out_time: '06:05 PM' },
        { _id: '2', employee_id: 'EMP002', name: 'Jane Smith', date: '2025-05-05', status: 'Present', in_time: '09:05 AM', out_time: '06:00 PM' },
        { _id: '3', employee_id: 'EMP003', name: 'Mike Johnson', date: '2025-05-05', status: 'Late', in_time: '09:45 AM', out_time: '06:15 PM' },
        { _id: '4', employee_id: 'EMP004', name: 'Sarah Wilson', date: '2025-05-05', status: 'Present', in_time: '08:50 AM', out_time: '05:55 PM' },
        { _id: '5', employee_id: 'EMP005', name: 'Robert Brown', date: '2025-05-05', status: 'Absent', in_time: '--', out_time: '--' },
        { _id: '6', employee_id: 'EMP006', name: 'Emily Davis', date: '2025-05-05', status: 'Half Day', in_time: '09:00 AM', out_time: '01:00 PM' },
        { _id: '7', employee_id: 'EMP001', name: 'John Doe', date: '2025-05-04', status: 'Present', in_time: '09:00 AM', out_time: '06:10 PM' },
        { _id: '8', employee_id: 'EMP002', name: 'Jane Smith', date: '2025-05-04', status: 'Present', in_time: '09:10 AM', out_time: '06:05 PM' },
        { _id: '9', employee_id: 'EMP003', name: 'Mike Johnson', date: '2025-05-04', status: 'Present', in_time: '08:55 AM', out_time: '05:50 PM' },
        { _id: '10', employee_id: 'EMP004', name: 'Sarah Wilson', date: '2025-05-04', status: 'Late', in_time: '10:00 AM', out_time: '06:00 PM' },
        { _id: '11', employee_id: 'EMP005', name: 'Robert Brown', date: '2025-05-04', status: 'Present', in_time: '08:45 AM', out_time: '05:45 PM' },
        { _id: '12', employee_id: 'EMP006', name: 'Emily Davis', date: '2025-05-04', status: 'Present', in_time: '09:00 AM', out_time: '06:00 PM' },
      ] as any);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
        ],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();

      // @ts-ignore
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      setUploading(true);
      await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Attendance sheet uploaded successfully');
      fetchAttendance();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Something went wrong'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          navigation.navigate('Home' as any);
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return '#4caf50';
      case 'Absent':
        return '#f44336';
      case 'Late':
        return '#ff9800';
      case 'Half Day':
        return '#ffc107';
      default:
        return '#999';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EmployeeDetails' as any, { record: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.employeeInfoContainer}>
          <Text style={styles.avatarEmoji}>👷</Text>
          <View>
            <Text style={styles.employeeInfo}>{item.name}</Text>
            <Text style={styles.employeeId}>ID: {item.employee_id}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.dateRow}>
          <Text style={styles.dateEmoji}>📅</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>🕒 In Time</Text>
            <Text style={styles.timeValue}>{item.in_time || '--:--'}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>🕒 Out Time</Text>
            <Text style={styles.timeValue}>{item.out_time || '--:--'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Tap to manage details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.adminName}>{user?.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.manageButton]}
          onPress={() => fetchAttendance()}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={styles.actionButtonText}>Manage Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.actionButtonIcon}>📤</Text>
              <Text style={styles.actionButtonText}>Upload Sheet</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{attendance.length}</Text>
          <Text style={styles.summaryLabel}>Total Records</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#e8f5e9' }]}>
          <Text style={[styles.summaryValue, { color: '#2e7d32' }]}>
            {attendance.filter((a: any) => a.status === 'Present').length}
          </Text>
          <Text style={styles.summaryLabel}>Present Today</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fff3e0' }]}>
          <Text style={[styles.summaryValue, { color: '#ef6c00' }]}>
            {attendance.filter((a: any) => a.status === 'Late' || a.status === 'Half Day').length}
          </Text>
          <Text style={styles.summaryLabel}>Exceptions</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>📊 Attendance Records</Text>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : attendance.length > 0 ? (
        <FlatList
          data={attendance}
          keyExtractor={(item: any) => item._id || item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1a73e8']}
            />
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭 No attendance records yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 12,
    color: '#999',
  },
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButton: {
    backgroundColor: '#1a73e8',
  },
  manageButton: {
    backgroundColor: '#34a853',
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarEmoji: {
    fontSize: 24,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  employeeInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  employeeId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  dateEmoji: {
    fontSize: 14,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
  },
  timeLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default AdminDashboard;
