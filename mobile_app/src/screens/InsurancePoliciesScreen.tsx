import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const InsurancePoliciesScreen = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lic-policy/employee');
      setPolicies(Array.isArray(response) ? response : [response]);
    } catch (error: any) {
      if (error?.error !== 'Please authenticate.') {
        console.error('Error fetching policies:', error);
      }
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPolicies();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading insurance policies...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Insurance Policies</Text>
        <Text style={styles.headerSubtitle}>View your assigned policies</Text>
      </View>

      {/* Policies List */}
      {policies && policies.length > 0 ? (
        policies.map((policy, index) => (
          <View key={index} style={styles.card}>
            {/* Policy Name */}
            <View style={styles.policyHeader}>
              <Text style={styles.policyName}>{policy.policyName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  policy.status === 'Active'
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}
              >
                <Text style={styles.statusText}>{policy.status || 'Active'}</Text>
              </View>
            </View>

            {/* Policy Number */}
            {policy.policyNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>Policy Number:</Text>
                <Text style={styles.value}>{policy.policyNumber}</Text>
              </View>
            )}

            {/* Coverage Amount */}
            {policy.coverageAmount && (
              <View style={styles.row}>
                <Text style={styles.label}>Coverage Amount:</Text>
                <Text style={[styles.value, { color: '#34a853' }]}>
                  ₹{policy.coverageAmount?.toLocaleString()}
                </Text>
              </View>
            )}

            {/* Premium Amount */}
            {policy.premiumAmount && (
              <View style={styles.row}>
                <Text style={styles.label}>Monthly Premium:</Text>
                <Text style={styles.value}>₹{policy.premiumAmount?.toLocaleString()}</Text>
              </View>
            )}

            {/* Policy Start Date */}
            {policy.policyStartDate && (
              <View style={styles.row}>
                <Text style={styles.label}>Start Date:</Text>
                <Text style={styles.value}>
                  {new Date(policy.policyStartDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {/* Policy End Date (if exists) */}
            {policy.policyEndDate && (
              <View style={styles.row}>
                <Text style={styles.label}>End Date:</Text>
                <Text style={styles.value}>
                  {new Date(policy.policyEndDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {/* Policy Description (if exists) */}
            {policy.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.description}>{policy.description}</Text>
              </View>
            )}

            {/* Claimed Amount (if exists) */}
            {policy.claimedAmount && policy.claimedAmount > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Claimed Amount:</Text>
                <Text style={[styles.value, { color: '#ff6b6b' }]}>
                  ₹{policy.claimedAmount?.toLocaleString()}
                </Text>
              </View>
            )}

            {/* Remaining Coverage (if exists) */}
            {policy.remainingCoverage && policy.remainingCoverage > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Remaining Coverage:</Text>
                <Text style={[styles.value, { color: '#2196F3' }]}>
                  ₹{policy.remainingCoverage?.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Policies Assigned</Text>
          <Text style={styles.emptyText}>
            You don't have any insurance policies assigned yet. Please contact your admin.
          </Text>
        </View>
      )}

      {/* Info Card */}
      {policies && policies.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Important Information</Text>
          <Text style={styles.infoText}>
            • The premium amount is automatically deducted from your monthly salary
          </Text>
          <Text style={styles.infoText}>
            • For policy claims or inquiries, contact your HR department
          </Text>
          <Text style={styles.infoText}>
            • Keep your policy documents safe for future reference
          </Text>
        </View>
      )}

      <View style={styles.spacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6b6b',
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
    color: '#ffcccc',
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
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  policyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 10,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
    flex: 1,
  },
  descriptionSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descriptionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 18,
    marginBottom: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  spacing: {
    height: 30,
  },
});

export default InsurancePoliciesScreen;
