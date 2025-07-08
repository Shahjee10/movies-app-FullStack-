import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import i18n from '../localization/i18n';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons'; // Added for eye icon

// Backend URL constant
const BACKEND_URL = 'http://192.168.100.21:5000'; // Change for production

export default function AccountScreen({ navigation }) {
  const { t } = useTranslation();

  const [user, setUser] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePic: '',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // State for current password
  const [showNewPassword, setShowNewPassword] = useState(false); // State for new password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('User not authenticated');

        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, profilePic } = response.data;
        setUser(prev => ({ ...prev, name, email, profilePic }));
      } catch (err) {
        console.error('Failed to load user:', err);
        Alert.alert(t('error'), t('failedToLoadUserData'));
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [t]);

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!user.name.trim()) {
      Alert.alert(t('validationError'), t('nameCannotBeEmpty'));
      return;
    }
    if (user.newPassword && user.newPassword !== user.confirmPassword) {
      Alert.alert(t('validationError'), t('passwordsDoNotMatch'));
      return;
    }

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');

      const updateData = { name: user.name };
      if (user.newPassword) {
        updateData.currentPassword = user.currentPassword;
        updateData.newPassword = user.newPassword;
      }

      await axios.put(`${BACKEND_URL}/api/auth/update`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert(t('success'), t('profileUpdatedSuccessfully'));
      setUser(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert(
        t('updateFailed'),
        err.response?.data?.message || t('failedToUpdateProfile')
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================
  // Updated pickImage function with improved permission handling
  // =====================
  const pickImage = async () => {
    console.log('📸 pickImage called');

    // Check existing permission first
    let { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      // Ask for permission
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = newStatus;
    }

    if (status !== 'granted') {
      // Show alert with option to open settings
      Alert.alert(
        t('permissionRequired'),
        t('pleaseEnableGalleryAccess'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('openSettings'), onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log('📁 Image Picker Result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log('🖼️ Selected Image URI:', imageUri);
      uploadImage(imageUri);
    }
  };

  // Image upload function (no changes)
  const uploadImage = async (uri) => {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();

    formData.append('profilePic', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/upload-dp`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Upload response:', response.data);
      setUser(prev => ({ ...prev, profilePic: response.data.path }));
      console.log('👁️ Final Image Preview URI:', `${BACKEND_URL}/${response.data.path}`);
      Alert.alert(t('success'), t('profilePicUpdated'));
    } catch (err) {
      console.error('❌ Image upload error:', err.response?.data || err.message);
      Alert.alert(t('uploadFailed'), t('couldNotUploadImage'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#1E1B26' }]}>
        <ActivityIndicator size="large" color="#FFE97F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#1E1B26' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Bar with Burger Menu */}
        <View style={styles.topBar}>
          <IconButton
            icon="menu"
            color="#FFE97F"
            size={28}
            onPress={() => navigation.openDrawer()}
          />
          <Text style={styles.title}>{t('accountDetails')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Picture */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              key={user.profilePic}
              source={
                user.profilePic
                  ? { uri: `${BACKEND_URL}/${user.profilePic}` }
                  : require('../assets/default-profile.png')
              }
              style={styles.profilePic}
            />
            <Text style={{ color: '#FFE97F', marginTop: 8, textAlign: 'center' }}>
              {t('changeProfilePicture')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('personalInformation')}</Text>

          <Text style={styles.label}>{t('email')}</Text>
          <View style={styles.disabledInput}>
            <Text style={styles.disabledText}>{user.email}</Text>
          </View>

          <Text style={styles.label}>{t('name')}</Text>
          <TextInput
            value={user.name}
            onChangeText={(text) => handleChange('name', text)}
            style={styles.input}
            placeholder={t('yourName')}
            placeholderTextColor="#999"
            cursorColor="#FFE97F"
            selectionColor="#FFE97F"
          />
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('passwordUpdate')}</Text>

          <Text style={styles.label}>{t('currentPassword')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={user.currentPassword}
              onChangeText={(text) => handleChange('currentPassword', text)}
              style={styles.input}
              placeholder={t('enterCurrentPassword')}
              secureTextEntry={!showCurrentPassword}
              placeholderTextColor="#999"
              cursorColor="#FFE97F"
              selectionColor="#FFE97F"
            />
            <TouchableOpacity
              style={styles.toggleButtonStyle}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <MaterialIcons
                name={showCurrentPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#FFE97F"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('newPassword')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={user.newPassword}
              onChangeText={(text) => handleChange('newPassword', text)}
              style={styles.input}
              placeholder={t('enterNewPassword')}
              secureTextEntry={!showNewPassword}
              placeholderTextColor="#999"
              cursorColor="#FFE97F"
              selectionColor="#FFE97F"
            />
            <TouchableOpacity
              style={styles.toggleButtonStyle}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <MaterialIcons
                name={showNewPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#FFE97F"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('confirmNewPassword')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={user.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              style={styles.input}
              placeholder={t('confirmNewPassword')}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#999"
              cursorColor="#FFE97F"
              selectionColor="#FFE97F"
            />
            <TouchableOpacity
              style={styles.toggleButtonStyle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#FFE97F"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={updating ? t('updating') : t('saveChanges')}
            onPress={handleUpdate}
            disabled={updating}
            color="#FFE97F"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE97F',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 28,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#FFE97F',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#CCC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 16,
    color: '#FFF',
    backgroundColor: '#2E2B38',
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    backgroundColor: '#3E3B47',
  },
  disabledText: {
    fontSize: 16,
    color: '#AAA',
  },
  buttonContainer: {
    marginTop: 10,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FFE97F',
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