import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]); // Feedback state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Admin Dashboard',
      headerStyle: { backgroundColor: '#1E1B26' },
      headerTitleStyle: { color: '#FFE97F', fontWeight: 'bold' },
      headerLeft: () => null, // Disable the default back button
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <MaterialIcons name="logout" size={24} color="#FFE97F" />
        </TouchableOpacity>
      ),
      headerTintColor: '#FFE97F',
    });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('AdminLogin');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Fetch both stats and feedbacks
  useEffect(() => {
    const fetchStatsAndFeedbacks = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No auth token found');

        const [statsRes, feedbackRes] = await Promise.all([
          axios.get('http://192.168.100.21:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://192.168.100.21:5000/api/admin/feedbacks', {
            headers: { Authorization: `Bearer ${token}` }, // Added Auth header here for consistency/security
          }),
        ]);

        setStats(statsRes.data);
        setFeedbacks(feedbackRes.data);
      } catch (err) {
        console.error('Failed to load stats/feedbacks', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndFeedbacks();
  }, []);

  // Retry fetch on error
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setFeedbacks([]);
    // Re-run effect manually
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No auth token found');

        const [statsRes, feedbackRes] = await Promise.all([
          axios.get('http://192.168.100.21:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://192.168.100.21:5000/api/admin/feedbacks', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(statsRes.data);
        setFeedbacks(feedbackRes.data);
      } catch (err) {
        console.error('Retry failed', err);
        setError('Retry failed. Please check your connection.');
      } finally {
        setLoading(false);
      }
    })();
  };

  if (loading) return <ActivityIndicator size="large" color="#FFE97F" style={styles.centered} />;

  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Users</Text>
        <Text style={styles.cardValue}>{stats.totalUsers}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Watchlist Items</Text>
        <Text style={styles.cardValue}>{stats.totalWatchlistItems}</Text>
      </View>

      <Text style={styles.subHeader}>Users List</Text>
      {stats.users && stats.users.length > 0 ? (
        stats.users.map((user) => (
          <TouchableOpacity
            key={user._id} // Use _id as key instead of index
            style={styles.userCard}
            onPress={() => navigation.navigate('UserProfile', { userId: user._id })} // Navigate to profile
          >
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userRole}>{user.role || 'user'}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noUsers}>No users found</Text>
      )}

      {/* FEEDBACK SECTION */}
      <Text style={styles.subHeader}>User Feedbacks</Text>
      {feedbacks.length === 0 ? (
        <Text style={styles.noUsers}>No feedbacks submitted</Text>
      ) : (
        feedbacks.map((fb) => (
          <View key={fb._id} style={styles.feedbackCard}>
            <Text style={[styles.userEmail, { marginBottom: 4 }]}>{fb.email}</Text>{/* Added margin bottom */}
            <Text style={styles.feedbackMessage}>{fb.message}</Text>
            <Text style={styles.feedbackTime}>{new Date(fb.createdAt).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1E1B26',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1B26',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#FFE97F',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#2A2735',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 8,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFE97F',
  },
  subHeader: {
    marginTop: 25,
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 22,
    color: '#FFE97F',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2A2735',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userRole: {
    fontSize: 16,
    color: '#FFE97F',
    fontWeight: '600',
  },
  noUsers: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  feedbackCard: {
    backgroundColor: '#2A2735',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFE97F',
  },
  feedbackMessage: {
    color: '#DDD',
    marginTop: 6,
    fontSize: 15,
  },
  feedbackTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#FFE97F',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#1E1B26',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AdminDashboardScreen;