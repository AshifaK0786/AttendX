import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AttendanceCardProps {
  date: string;
  inTime?: string;
  outTime?: string;
  status: string;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  date,
  inTime,
  outTime,
  status,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return '#27ae60';
      case 'absent':
        return '#e74c3c';
      case 'late':
        return '#f39c12';
      case 'half day':
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.dateSection}>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>

        <View style={styles.statusSection}>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </View>

      {(inTime || outTime) && (
        <View style={styles.timeSection}>
          {inTime && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>In Time</Text>
              <Text style={styles.timeValue}>{inTime}</Text>
            </View>
          )}
          {outTime && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Out Time</Text>
              <Text style={styles.timeValue}>{outTime}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dateSection: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusSection: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
