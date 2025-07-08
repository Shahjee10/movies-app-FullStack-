import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

export default function ResetPasswordScreen() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async () => {
    try {
      await axios.post('http://192.168.100.21:5000/api/auth/reset-password', { token, newPassword });
      Alert.alert('Success', 'Password has been reset!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter reset token (from console):</Text>
      <TextInput value={token} onChangeText={setToken} style={{ borderWidth: 1, marginVertical: 10 }} />
      <TextInput
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20 }}
      />
      <Button title="Reset Password" onPress={handleReset} />
    </View>
  );
}
