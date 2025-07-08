// VerifyOTPScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const BACKEND_URL = 'http://192.168.100.21:5000/api/auth';

export default function VerifyOTPScreen({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false); // 🆕 For resend feature

  const { email } = route.params;

 const handleVerifyOTP = async () => {
  if (!otp.trim()) {
    Alert.alert('Validation Error', 'Please enter the OTP sent to your email');
    return;
  }

  setLoading(true); // 🟡 Set loading only when verifying
  try {
    const res = await axios.post(`${BACKEND_URL}/verify-signup-otp`, { email, otp });
    Alert.alert('Success', res.data.message || 'OTP verified successfully');
    navigation.navigate('Login');
  } catch (error) {
    // ✅ This part shows the error and allows retry
    Alert.alert('Error', error.response?.data?.message || 'Verification failed');
    // ❌ DO NOT clear OTP here
  } finally {
    setLoading(false); // ✅ Make sure button becomes active again
  }
};


  // 🆕 Optional: Add resend OTP feature
  const resendOtp = async () => {
    setResending(true);
    try {
      await axios.post(`${BACKEND_URL}/signup-request`, {
        email,
        name: 'Placeholder', // backend ignores this if user already created
        password: 'dummy123', // not used, just for bypass – optional
      });
      Alert.alert('OTP Sent Again', 'Check your email for the new OTP');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
  <Text style={styles.backArrowText}>←</Text>
</TouchableOpacity>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter OTP"
          placeholderTextColor="#BBB"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          cursorColor="#FFE97F"
          selectionColor="#FFE97F"
          textAlign="center"
        />

     <TouchableOpacity
  style={[styles.button, (loading || otp.length < 6) && styles.buttonDisabled]}
  onPress={handleVerifyOTP}
  disabled={loading || otp.length < 6} // ✅ This is the correct prop
>
  {loading ? (
    <ActivityIndicator size="small" color="#1E1B26" />
  ) : (
    <Text style={styles.buttonText}>Verify OTP</Text>
  )}
</TouchableOpacity>


        {/* 🆕 Optional Resend OTP */}
        <TouchableOpacity onPress={resendOtp} disabled={resending} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: '#FFE97F' }}>
            {resending ? 'Resending OTP...' : 'Didn’t get OTP? Resend'}
          </Text>
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFE97F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBB',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#2E2B38',
    color: '#FFF',
    fontSize: 24,
    borderRadius: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#FFE97F',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#B8A965',
  },
  buttonText: {
    color: '#1E1B26',
    fontWeight: 'bold',
    fontSize: 18,
  },

  backArrow: {
  position: 'absolute',
  top: 80,
  left: 30,
  zIndex: 10,
},

backArrowText: {
  fontSize: 28,
  color: '#FFE97F',
},

});
