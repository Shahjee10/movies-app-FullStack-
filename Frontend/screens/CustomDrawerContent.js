import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Image } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';

export default function CustomDrawerContent(props) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role === 'admin') setIsAdmin(true);
    };
    checkRole();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.log('Logout Error:', err);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Image
          source={require('../assets/images/splash.png')}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Welcome!</Text>
      </View>

      <DrawerItemList
        {...props}
        activeTintColor="#FFE97F"
        inactiveTintColor="#B0B0B0"
        labelStyle={styles.label}
      />

      {/* Logout button */}
      <DrawerItem
        label={() => <Text style={[styles.label, { color: '#FF4C61', fontWeight: 'bold' }]}>Logout</Text>}
        onPress={handleLogout}
        inactiveTintColor="#FF4C61"
        icon={({ color, size }) => (
          <IconButton icon="logout" color="#FF4C61" size={size} style={{ margin: 0 }} />
        )}
        style={styles.logoutButton}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B26',
    paddingTop: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 10,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 40,
  },
  headerText: {
    color: '#FFE97F',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});
