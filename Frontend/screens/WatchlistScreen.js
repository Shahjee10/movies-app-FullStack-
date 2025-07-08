import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Card, Title, IconButton } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // for refreshing on screen focus

const BACKEND_URL = 'http://192.168.100.21:5000/api';

export default function WatchlistScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the user's watchlist from backend
  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Watchlist data:', res.data); // Debug duplicate IDs
      setWatchlist(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  // Remove movie from watchlist by TMDB ID
  const removeFromWatchlist = async (movieId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWatchlist();
    } catch (err) {
      console.error(err);
      alert('Failed to remove movie');
    }
  };

  // Refresh on mount and on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchWatchlist();
    }, [])
  );

  // Render each movie card
  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('MovieDetails', {
          movie: item.movieData,
        })
      }
    >
      <Card.Cover
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.movieData.poster_path}` }}
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <Title numberOfLines={1} style={styles.cardTitle}>{item.movieData.title}</Title>
        <IconButton
          icon="delete"
          color="#FF4C61"
          size={24}
          onPress={() => removeFromWatchlist(item.movieData.id)}
          style={styles.deleteIcon}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar with burger menu */}
        <View style={styles.topBar}>
          <IconButton
            icon="menu"
            color="#FFE97F"
            size={28}
            onPress={() => navigation.openDrawer()}
          />
          <Text style={styles.title}>Watchlist</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : watchlist.length === 0 ? (
          <Text style={styles.emptyText}>No movies in your watchlist yet.</Text>
        ) : (
          <FlatList
            data={watchlist}
            keyExtractor={(item, index) => `${item.movieData.id}-${index}`} // Ensure unique keys with index fallback
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            maxToRenderPerBatch={10} // Optimize for large lists
            windowSize={5} // Reduce visible window
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1B26',
  },
  container: {
    flex: 1,
    padding: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE97F',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 28,
  },
  card: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2E2B38',
    elevation: 4,
  },
  cardImage: {
    height: 230,
    backgroundColor: '#444',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cardTitle: {
    color: '#FFE97F',
    fontSize: 16,
    flex: 1,
  },
  deleteIcon: {
    margin: 0,
  },
  loadingText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#ccc',
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
});