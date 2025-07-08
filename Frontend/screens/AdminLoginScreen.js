import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // Added for eye icon

const BACKEND_URL = 'http://192.168.100.21:5000/api/auth';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/login`, { email, password });

      if (response.status === 200) {
        const { token, role, name, email: userEmail } = response.data;

        if (role !== 'admin') {
          Alert.alert('Access Denied', 'You are not authorized to access admin panel');
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify({ name, email: userEmail, role }));

        Alert.alert('Success', 'Logged in successfully!');
        navigation.replace('AdminDashboard');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, styles.inactiveToggle]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.toggleTextInactive}>User Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, styles.activeToggle]}>
            <Text style={styles.toggleTextActive}>Admin Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Admin Login</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#BBB"
          cursorColor="#FFE97F"
          selectionColor="#FFE97F"
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword} // Toggle based on showPassword state
            autoCapitalize="none"
            placeholderTextColor="#BBB"
            cursorColor="#FFE97F"
            selectionColor="#FFE97F"
          />
          <TouchableOpacity
            style={styles.toggleButtonStyle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color="#FFE97F"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAdminLogin}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1E1B26" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#1E1B26',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 80,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: '#FFE97F',
  },
  inactiveToggle: {
    backgroundColor: '#2E2B38',
    borderWidth: 1,
    borderColor: '#FFE97F',
  },
  toggleTextActive: {
    color: '#1E1B26',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  toggleTextInactive: {
    color: '#FFE97F',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFE97F',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#2E2B38',
    color: '#FFF',
    fontSize: 16,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#FFE97F',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#B8A965',
  },
  buttonText: {
    color: '#1E1B26',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputContainer: {
    position: 'relative',
  },
  toggleButtonStyle: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 5,
  },
});