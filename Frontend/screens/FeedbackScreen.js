import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const BACKEND_URL = 'http://192.168.100.21:5000';
 // update your backend URL

export default function FeedbackScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!email || !message) {
      Alert.alert('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/feedback`, {
        email,
        message,
      });
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E1B26', '#2E2B38']} style={styles.gradient}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentWrapper}>
              <Text style={styles.heading}>Contact / Feedback</Text>

              <TextInput
                style={styles.input}
                placeholder="Your Email"
                placeholderTextColor="#AAA"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                selectionColor="#FFE97F"
                cursorColor="#FFE97F"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Your Message"
                placeholderTextColor="#AAA"
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
                maxLength={500}
                selectionColor="#FFE97F"
                cursorColor="#FFE97F"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={submitFeedback}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center', // center vertically
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  contentWrapper: {
    backgroundColor: '#2E2B38',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFE97F',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E1B26',
    color: '#FFE97F',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4C4A58',
  },
  textArea: {
    height: height * 0.18,
  },
  button: {
    backgroundColor: '#FFE97F',
    borderRadius: 30,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#1E1B26',
    fontSize: 18,
    fontWeight: '700',
  },
});
