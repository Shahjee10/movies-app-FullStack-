// api/adminApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://YOUR_BACKEND_IP_OR_DOMAIN:PORT';  // replace with your backend URL

export async function fetchAdminStats() {
  try {
    // Get token stored after login
    const token = await AsyncStorage.getItem('token'); 
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // pass JWT token in header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch admin stats');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('fetchAdminStats error:', error.message);
    throw error;
  }
}
