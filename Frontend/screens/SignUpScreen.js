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

const BACKEND_URL = 'http://192.168.100.21:5000/api/auth';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/signup-request`, {
        name,
        email,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'OTP sent to your email. Please verify.');
        navigation.navigate('VerifyOTP', { email });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong!'
      );
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
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
          placeholderTextColor="#BBB"
          cursorColor="#FFE97F"
          selectionColor="#FFE97F"
        />

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

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor="#BBB"
          cursorColor="#FFE97F"
          selectionColor="#FFE97F"
        />

        <TouchableOpacity
          onPress={handleSignup}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1E1B26" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#1E1B26', // Dark background
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFE97F', // Accent color
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#2E2B38', // Dark input background
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#AAA',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFE97F',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
