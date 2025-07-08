import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.100.21:5000';

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No auth token found');

        const res = await axios.get(`${BACKEND_URL}/api/admin/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile(res.data);
      } catch (err) {
        setError('Failed to load user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // 📦 Show loading indicator
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#FFE97F"
        style={styles.centered}
      />
    );
  }

  // ❌ Error handling
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  // ❌ No user found
  if (!userProfile) {
    return <Text style={styles.error}>User profile not found.</Text>;
  }

  // ✅ Format join date
  const formattedJoinDate = userProfile.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* User Info Card */}
      <View style={styles.userCard}>
        <Text style={styles.title}>{userProfile.name || 'Unnamed User'}</Text>
        <Text style={styles.subTitle}>📧 {userProfile.email || '-'}</Text>
        <Text style={styles.subTitle}>🧑 Role: {userProfile.role || 'user'}</Text>
        <Text style={styles.subTitle}>📅 Joined: {formattedJoinDate}</Text>
        <Text style={styles.subTitle}>🎬 Watchlist: {userProfile.watchlistCount ?? 0} items</Text>
      </View>

      {/* Feedbacks Section */}
      <Text style={styles.sectionHeader}>🗣️ User Feedbacks</Text>
      {userProfile.feedbacks.length === 0 ? (
        <Text style={styles.noFeedback}>No feedback from this user.</Text>
      ) : (
        userProfile.feedbacks.map((fb) => (
          <View key={fb._id} style={styles.feedbackCard}>
            <Text style={styles.feedbackMessage}>{fb.message}</Text>
            <Text style={styles.feedbackDate}>
              {new Date(fb.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121018',
    paddingHorizontal: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121018',
  },
  error: {
    color: '#FF4C61',
    textAlign: 'center',
    marginTop: 40,
    fontWeight: '600',
    fontSize: 16,
  },
  userCard: {
    backgroundColor: '#2A2735',
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 25,
    marginTop: 200,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFE97F',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFE97F',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFE97F',
    paddingBottom: 8,
    marginBottom: 20,
  },
  noFeedback: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackCard: {
    backgroundColor: '#1E1B26',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#FFE97F',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  feedbackMessage: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
  },
  feedbackDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
