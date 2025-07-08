import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next'; // ✅ Import translation hook

const TMDB_API_KEY = 'd880cb82fec483b86f593375abe07074';
const { width } = Dimensions.get('window');

export default function MovieDetails({ route }) {
  const { t, i18n } = useTranslation(); // ✅ Hook
  const { movie } = route.params;
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos`,
          {
            params: {
              api_key: TMDB_API_KEY,
              language: i18n.language === 'ur' ? 'ur' : 'en-US', // ✅ Language aware
            },
          }
        );
        const videos = res.data.results;
        const trailer = videos.find(
          (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (error) {
        console.error('Failed to fetch trailer', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailer();
  }, [movie.id, i18n.language]);

  const formattedDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : t('unknown');

  const today = new Date();
  const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
  const isReleased = releaseDate ? releaseDate <= today : false;

  return (
    <LinearGradient
      colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Poster */}
          {movie.poster_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          )}

          {/* Title */}
          <Text style={styles.title}>{movie.title}</Text>

          {/* Release Info */}
          <View style={styles.releaseContainer}>
            <Text style={[styles.releaseText, isReleased ? styles.released : styles.upcoming]}>
              {isReleased
                ? `${t('releasedOn')} ${formattedDate}`
                : `${t('yetToReleaseOn')} ${formattedDate}`}
            </Text>
          </View>

          {/* Overview */}
          <Text style={styles.overview}>
            {movie.overview || t('noOverviewAvailable')}
          </Text>

          {/* Loading Spinner */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#b21f1f" />
            </View>
          )}

          {/* Trailer */}
          {trailerKey ? (
            <View style={styles.playerContainer}>
              <YoutubePlayer height={230} play={false} videoId={trailerKey} />
            </View>
          ) : !loading ? (
            <Text style={styles.noTrailerText}>{t('noTrailerAvailable')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff8f0',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    shadowColor: '#b21f1f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
    marginTop: 35,
  },
  poster: {
    width: '100%',
    height: 320,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: '#ddd',
    shadowColor: '#b21f1f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a2a6c',
    marginBottom: 12,
    textAlign: 'center',
  },
  releaseContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  releaseText: {
    fontSize: 16,
    fontWeight: '700',
  },
  released: {
    color: '#1a2a6c',
  },
  upcoming: {
    color: '#b21f1f',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5a4d4d',
    marginBottom: 24,
    textAlign: 'justify',
  },
  loadingContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  playerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1a2a6c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  noTrailerText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7a6e6e',
    textAlign: 'center',
    marginBottom: 20,
  },
});
