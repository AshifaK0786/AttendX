import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SalarySlipScreen = () => {
  const { user } = useAuth();
  const [salary, setSalary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSalary();
  }, [month, year]);

  const fetchSalary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/salary/employee', {
        params: { month, year },
      });
      setSalary(Array.isArray(response) ? response[0] : response);
    } catch (error: any) {
      if (error?.error !== 'Please authenticate.') {
        console.error('Error fetching salary:', error);
      }
      setSalary(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#34a853" />
        <Text style={styles.loadingText}>Loading salary details...</Text>
      </View>
    );
  }

  if (!salary) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💰 Salary Slip</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭 No salary record for this month</Text>
        </View>
      </View>
    );
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Salary Slip</Text>
        <Text style={styles.monthYear}>
          {monthNames[month - 1]} {year}
        </Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousMonth}>
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Salary Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Attendance Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Total Working Days:</Text>
          <Text style={styles.value}>{salary.totalWorkingDays}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Present Days:</Text>
          <Text style={[styles.value, { color: '#4caf50' }]}>
            {salary.presentDays}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Absent Days:</Text>
          <Text style={[styles.value, { color: '#f44336' }]}>
            {salary.absentDays}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Late Days:</Text>
          <Text style={[styles.value, { color: '#ff9800' }]}>
            {salary.lateDays}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Half Days:</Text>
          <Text style={[styles.value, { color: '#ffc107' }]}>
            {salary.halfDays}
          </Text>
        </View>
      </View>

      {/* Salary Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💸 Salary Breakdown</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Base Salary:</Text>
          <Text style={styles.value}>₹{salary.baseSalary?.toLocaleString()}</Text>
        </View>
        {salary.halfDaySalary > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Half Day Salary:</Text>
            <Text style={styles.value}>₹{salary.halfDaySalary?.toLocaleString()}</Text>
          </View>
        )}
        {salary.overtimeSalary > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Overtime Salary:</Text>
            <Text style={styles.value}>₹{salary.overtimeSalary?.toLocaleString()}</Text>
          </View>
        )}

        <View style={[styles.row, styles.rowHighlight]}>
          <Text style={[styles.label, styles.labelBold]}>Gross Salary:</Text>
          <Text style={[styles.value, styles.valueBold]}>
            ₹{salary.grossSalary?.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Deductions & Bonuses */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📉 Deductions & Bonuses</Text>

        {salary.bonus > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: '#4caf50' }]}>+ Bonus:</Text>
            <Text style={[styles.value, { color: '#4caf50' }]}>
              +₹{salary.bonus?.toLocaleString()}
            </Text>
          </View>
        )}

        {salary.insuranceDeduction > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: '#f44336' }]}>
              - Insurance:
            </Text>
            <Text style={[styles.value, { color: '#f44336' }]}>
              -₹{salary.insuranceDeduction?.toLocaleString()}
            </Text>
          </View>
        )}

        {salary.penalties > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: '#ff9800' }]}>
              - Penalties:
            </Text>
            <Text style={[styles.value, { color: '#ff9800' }]}>
              -₹{salary.penalties?.toLocaleString()}
            </Text>
          </View>
        )}

        {salary.advanceDeduction > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: '#f44336' }]}>
              - Advance:
            </Text>
            <Text style={[styles.value, { color: '#f44336' }]}>
              -₹{salary.advanceDeduction?.toLocaleString()}
            </Text>
          </View>
        )}

        <View style={[styles.row, styles.rowHighlight]}>
          <Text style={[styles.label, styles.labelBold]}>Total Deductions:</Text>
          <Text style={[styles.value, styles.valueBold]}>
            -₹{salary.totalDeductions?.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Net Salary */}
      <View style={[styles.card, styles.cardNet]}>
        <Text style={styles.cardTitle}>✓ Net Salary</Text>
        <View style={styles.rowNet}>
          <Text style={styles.labelNet}>Total Amount:</Text>
          <Text style={styles.valueNet}>₹{salary.netSalary?.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#34a853',
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
  monthYear: {
    fontSize: 16,
    color: '#e8f5e9',
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34a853',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34a853',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowHighlight: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    marginHorizontal: -10,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  labelBold: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  valueBold: {
    fontSize: 16,
  },
  cardNet: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#34a853',
  },
  rowNet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  labelNet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  valueNet: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
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
  spacing: {
    height: 30,
  },
});

export default SalarySlipScreen;
