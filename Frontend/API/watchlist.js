import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.100.21:5000/api/watchlist';

// Add movie to watchlist
export const addToWatchlist = async (movie) => {
  const token = await AsyncStorage.getItem('token');
  return axios.post(BACKEND_URL, { movieId: movie.id, movieData: movie }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Get user's watchlist
export const getWatchlist = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(BACKEND_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; // array of watchlist movies
};

// Remove movie from watchlist
export const removeFromWatchlist = async (movieId) => {
  const token = await AsyncStorage.getItem('token');
  return axios.delete(`${BACKEND_URL}/${movieId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
