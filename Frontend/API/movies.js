import axios from 'axios';

const API_KEY = 'd880cb82fec483b86f593375abe07074';
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getPopularMovies = async () => {
  const response = await api.get('/movie/popular');
  return response.data.results;
};
