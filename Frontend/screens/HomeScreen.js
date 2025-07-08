import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Title,
  Provider as PaperProvider,
  IconButton,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import i18n from '../localization/i18n'; // import i18n for translation usage

const BACKEND_URL = 'http://192.168.100.21:5000/api';
const TMDB_API_KEY = 'd880cb82fec483b86f593375abe07074';

export default function HomeScreen({ navigation }) {
  // Movies data, search query, genres and selections
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistMovieIds, setWatchlistMovieIds] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [tempGenre, setTempGenre] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Dark mode toggle state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Pagination and loading state
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Current language for manual toggle
  const [lang, setLang] = useState(i18n.language || 'en');

  // Fetch genres once on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
          params: { api_key: TMDB_API_KEY, language: lang === 'ur' ? 'ur' : 'en-US' },
        });
        setGenres(res.data.genres);
      } catch (err) {
        console.error('Failed to fetch genres', err);
      }
    };
    fetchGenres();
  }, [lang]); // refetch genres if language changes

  // Fetch movies when search query or genre changes, reset page
  useEffect(() => {
    setPage(1);
    if (searchQuery.trim() === '') {
      loadPopularMovies(true);
    } else {
      searchMovies(searchQuery, true);
    }
  }, [searchQuery, selectedGenre, lang]);

  // Fetch more movies when page increments (pagination)
  useEffect(() => {
    if (page === 1) return; // page 1 handled above
    if (searchQuery.trim() === '') {
      loadPopularMovies();
    } else {
      searchMovies(searchQuery);
    }
  }, [page]);

  // Load popular movies, optionally resetting list
  const loadPopularMovies = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const url = selectedGenre && selectedGenre !== 'all'
        ? `https://api.themoviedb.org/3/discover/movie`
        : `https://api.themoviedb.org/3/movie/popular`;

      const params = {
        api_key: TMDB_API_KEY,
        page,
        language: lang === 'ur' ? 'ur' : 'en-US',
      };

      if (selectedGenre && selectedGenre !== 'all') {
        params.with_genres = selectedGenre;
      }

      const res = await axios.get(url, { params });
      const newMovies = res.data.results;
      setMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNewMovies = newMovies.filter((m) => !existingIds.has(m.id));
        return reset ? newMovies : [...prev, ...uniqueNewMovies];
      });
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search movies by query with optional reset
  const searchMovies = async (query, reset = false) => {
  if (loading) return;
  setLoading(true);

  // Urdu Unicode block detection regex
  const urduRegex = /[\u0600-\u06FF]/;

  // Transliterate if query contains Urdu characters
  let searchQuery = query;
  if (urduRegex.test(query)) {
    searchQuery = transliterateUrduToEnglish(query);
  }

  try {
    const res = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: searchQuery,
        page,
        language: lang === 'ur' ? 'ur' : 'en-US',
      },
    });
    const newMovies = res.data.results;
    setMovies((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const uniqueNewMovies = newMovies.filter((m) => !existingIds.has(m.id));
      return reset ? newMovies : [...prev, ...uniqueNewMovies];
    });
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    setLoading(false);
  }
};


  // Load next page for infinite scroll
  const loadMore = () => {
    if (!loading) setPage((prev) => prev + 1);
  };

  // Add movie to watchlist in backend
  const addToWatchlist = async (movie) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/watchlist`,
        { movieId: movie.id, movieData: movie },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWatchlistMovieIds((prev) => [...prev, movie.id]);
      alert(`${movie.title} ${i18n.t('addedToWatchlist')}`);
    } catch (error) {
      console.error(error);
      alert(i18n.t('errorAddingToWatchlist'));
    }
  };

  // Remove movie from watchlist in backend
  const removeFromWatchlist = async (movieId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlistMovieIds((prev) => prev.filter((id) => id !== movieId));
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle watchlist state for a movie
  const toggleWatchlist = (movie) => {
    if (watchlistMovieIds.includes(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  // Toggle between dark and light themes
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Apply selected genre and close picker modal
  const handleSelectGenre = () => {
    setSelectedGenre(tempGenre);
    setIsPickerVisible(false);
  };

  // Toggle language and refresh content
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    setLang(newLang);
    setSearchQuery(''); // trigger refresh
  };

  //translating urdu words to english 
  const transliterateUrduToEnglish = (text) => {
  const map = {
    'ا': 'a',
    'ب': 'b',
    'پ': 'p',
    'ت': 't',
    'ٹ': 't',
    'ث': 's',
    'ج': 'j',
    'چ': 'ch',
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ڈ': 'd',
    'ذ': 'z',
    'ر': 'r',
    'ڑ': 'r',
    'ز': 'z',
    'ژ': 'zh',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'z',
    'ط': 't',
    'ظ': 'z',
    'ع': 'a',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'q',
    'ک': 'k',
    'گ': 'g',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ں': 'n',
    'و': 'w',
    'ہ': 'h',
    'ء': "'",
    'ی': 'y',
    'ے': 'e',
  };

  return text
    .split('')
    .map((char) => map[char] || char)
    .join('');
};


  // Render each movie card with watchlist heart icon and navigation
  const renderItem = useCallback(({ item }) => {
    const isInWatchlist = watchlistMovieIds.includes(item.id);
    return (
      <Card
        style={[styles.card, { backgroundColor: isDarkMode ? '#2E2B38' : '#F5F5F5' }]}
        onPress={() =>
          navigation.navigate('MovieDetails', {
            movie: { ...item, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          })
        }
      >
        <View style={styles.cardImageWrapper}>
          <Card.Cover
            source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
            style={styles.cardImage}
          />
        </View>

        <Card.Content style={styles.cardContent}>
          <Title numberOfLines={1} style={[styles.cardTitle, { color: isDarkMode ? '#FFE97F' : '#333' }]}>
            {item.title}
          </Title>
          <IconButton
            icon={isInWatchlist ? 'heart' : 'heart-outline'}
            color={isInWatchlist ? '#FF4C61' : isDarkMode ? '#B0B0B0' : '#666'}
            size={24}
            onPress={() => toggleWatchlist(item)}
          />
        </Card.Content>
      </Card>
    );
  }, [watchlistMovieIds, isDarkMode]);

  return (
    <PaperProvider>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setIsPickerVisible(false);
        }}
      >
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1B26' : '#E5E5E5' }]}>
          {/* Top Bar with menu, title, language and theme toggles */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <IconButton icon="menu" color={isDarkMode ? '#FFF' : '#333'} size={24} />
            </TouchableOpacity>
            <Text style={[styles.navbarTitle, { color: isDarkMode ? '#FFE97F' : '#333' }]}>
              {i18n.t('home')}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="translate" onPress={toggleLanguage} color={isDarkMode ? '#FFF' : '#333'} />
              <IconButton
                icon={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
                onPress={toggleTheme}
                color={isDarkMode ? '#FFF' : '#333'}
              />
            </View>
          </View>

          {/* Welcome message below top bar */}
          <Text style={[styles.welcomeMessage, { color: isDarkMode ? '#FFE97F' : '#555' }]}>
            {i18n.t('welcome')}
          </Text>

          {/* Search bar and genre picker button */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={i18n.t('searchPlaceholder')}
              value={searchQuery}
              onChangeText={(text) => {
                setPage(1);
                setSearchQuery(text);
              }}
              style={[
                styles.searchInput,
                { backgroundColor: isDarkMode ? '#3E3B47' : '#F0F0F0', color: isDarkMode ? '#FFF' : '#333' },
              ]}
              placeholderTextColor={isDarkMode ? '#FFF' : '#666'}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: isDarkMode ? '#3E3B47' : '#F0F0F0' }]}
              onPress={() => setIsPickerVisible(!isPickerVisible)}
            >
              <IconButton icon={isPickerVisible ? 'chevron-up' : 'chevron-down'} color={isDarkMode ? '#FFF' : '#333'} size={24} />
            </TouchableOpacity>
          </View>

          {/* Genre Picker modal */}
          <Modal visible={isPickerVisible} transparent animationType="slide" onRequestClose={() => setIsPickerVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setIsPickerVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#2E2B38' : '#FFFFFF' }]}>
                    <View style={{ borderRadius: 10, overflow: 'hidden' }}>
                      <Picker
                        selectedValue={tempGenre}
                        onValueChange={(value) => setTempGenre(value)}
                        style={[
                          styles.picker,
                          {
                            color: isDarkMode ? '#FFF' : '#000',
                            backgroundColor: isDarkMode ? '#2E2B38' : '#FFF',
                          },
                        ]}
                        dropdownIconColor={isDarkMode ? '#FFF' : '#000'}
                        mode="dropdown"
                      >
                        <Picker.Item label={i18n.t('genre')} value="" enabled={false} color={isDarkMode ? '#FFF' : '#000'} />
                        {genres.map((genre) => (
                          <Picker.Item key={genre.id} label={genre.name} value={genre.id.toString()} color={isDarkMode ? '#FFF' : '#000'} />
                        ))}
                        <Picker.Item label={i18n.t('allGenres')} value="all" color={isDarkMode ? '#FFF' : '#000'} />
                      </Picker>
                    </View>
                    <Button title={i18n.t('select')} onPress={handleSelectGenre} color={isDarkMode ? '#FFE97F' : '#333'} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Movie list */}
          <FlatList
            data={movies}
            keyExtractor={(item) => `${item.id}-${item.title}`}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && movies.length > 0 ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="large" color={isDarkMode ? '#FFE97F' : '#333'} />
                </View>
              ) : null
            }
          />

          {/* Loading indicator on initial load */}
          {loading && movies.length === 0 && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={isDarkMode ? '#FFE97F' : '#333'} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 35,
  },
  navbarTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginTop:10,
    left:20
  },
  welcomeMessage: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop:10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 8,
  },
  dropdownButton: {
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    borderRadius: 10,
    marginBottom: 10,
  },
  card: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 5,
  },
  cardImageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    height: 220,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
});
