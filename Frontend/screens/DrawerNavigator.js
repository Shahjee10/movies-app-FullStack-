import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import AccountScreen from './AccountScreen';
import WatchlistScreen from './WatchlistScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import FeedbackScreen from './FeedbackScreen';
import CustomDrawerContent from './CustomDrawerContent';
import { IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Token parsing failed:', e);
    return null;
  }
};

export default function DrawerNavigator() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded = parseJwt(token);
          setUserRole(decoded?.role || 'user');
        }
      } catch (error) {
        console.error('Failed to fetch user role', error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#1E1B26',
          width: 240,
        },
        drawerActiveTintColor: '#FFE97F',
        drawerInactiveTintColor: '#B0B0B0',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <IconButton icon="home" color={color} size={size} style={{ margin: 0 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Account"
        component={AccountScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <IconButton icon="account" color={color} size={size} style={{ margin: 0 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <IconButton icon="heart" color={color} size={size} style={{ margin: 0 }} />
          ),
        }}
      />
      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <IconButton icon="message-text-outline" color={color} size={size} style={{ margin: 0 }} />
          ),
        }}
      />

      {/* Wrap conditional inside React Fragment to avoid error */}
      <>
        {userRole === 'admin' && (
          <Drawer.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{
              drawerIcon: ({ color, size }) => (
                <IconButton icon="shield-account" color={color} size={size} style={{ margin: 0 }} />
              ),
            }}
          />
        )}
      </>
    </Drawer.Navigator>
  );
}
