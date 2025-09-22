import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, Title, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const UserPreferencesScreen = ({ onComplete }) => {
  const [preferences, setPreferences] = useState({
    interests: [],
    activityLevel: '',
    weatherPreferences: [],
    notificationSettings: {
      weatherAlerts: true,
      activityReminders: true,
      weeklyForecast: true,
    },
    units: 'metric', // metric or imperial
    theme: 'auto', // auto, light, dark
  });

  const [loading, setLoading] = useState(false);

  const interestOptions = [
    'Outdoor Activities',
    'Fitness & Sports',
    'Indoor Activities',
    'Travel & Adventure',
    'Food & Dining',
    'Entertainment',
    'Health & Wellness',
    'Social Events',
    'Learning & Education',
    'Hobbies & Crafts',
  ];

  const activityLevels = [
    { key: 'low', label: 'Low - Prefer gentle activities', icon: 'walk' },
    { key: 'moderate', label: 'Moderate - Regular activities', icon: 'run' },
    { key: 'high', label: 'High - Intense activities', icon: 'weight-lifter' },
    { key: 'varied', label: 'Varied - Mix of all levels', icon: 'chart-line' },
  ];

  const weatherPreferences = [
    { key: 'sunny', label: 'Sunny Days', icon: 'weather-sunny' },
    { key: 'cloudy', label: 'Cloudy Days', icon: 'weather-cloudy' },
    { key: 'rainy', label: 'Rainy Days', icon: 'weather-rainy' },
    { key: 'snowy', label: 'Snowy Days', icon: 'weather-snowy' },
    { key: 'windy', label: 'Windy Days', icon: 'weather-windy' },
    { key: 'foggy', label: 'Foggy Days', icon: 'weather-fog' },
  ];

  const handleInterestToggle = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleWeatherPreferenceToggle = (weather) => {
    setPreferences(prev => ({
      ...prev,
      weatherPreferences: prev.weatherPreferences.includes(weather)
        ? prev.weatherPreferences.filter(item => item !== weather)
        : [...prev.weatherPreferences, weather]
    }));
  };

  const handleNotificationToggle = (setting) => {
    setPreferences(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [setting]: !prev.notificationSettings[setting]
      }
    }));
  };

  const handleSave = async () => {
    if (preferences.interests.length === 0) {
      Alert.alert('Please select at least one interest');
      return;
    }

    if (!preferences.activityLevel) {
      Alert.alert('Please select your activity level');
      return;
    }

    setLoading(true);
    try {
      // Save preferences to Supabase
      const { AuthService } = await import('../services/supabase');
      const result = await AuthService.updateProfile({
        preferences: preferences,
        preferences_completed: true,
        preferences_completed_at: new Date().toISOString(),
      });

      if (result.success) {
        Alert.alert(
          'Preferences Saved!',
          'Your preferences have been saved successfully.',
          [{ text: 'Continue', onPress: onComplete }]
        );
      } else {
        throw new Error(result.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert(
        'Error', 
        `Failed to save preferences: ${error.message || 'Please try again.'}`
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={getBackgroundImage(null)}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleLine1}>Set your</Text>
            <Text style={styles.titleLine2}>Preferences</Text>
            <Text style={styles.titleLine3}>Now</Text>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personalize your experience</Text>
            <Text style={styles.sectionSubtitle}>Help us tailor weather and activity suggestions just for you</Text>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>What are you interested in?</Text>
            <Text style={styles.cardSubtitle}>Select all that apply</Text>
            <View style={styles.chipContainer}>
              {interestOptions.map((interest) => (
                <Chip
                  key={interest}
                  selected={preferences.interests.includes(interest)}
                  onPress={() => handleInterestToggle(interest)}
                  style={[
                    styles.chip,
                    preferences.interests.includes(interest) && styles.selectedChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    preferences.interests.includes(interest) && styles.selectedChipText
                  ]}
                >
                  {interest}
                </Chip>
              ))}
            </View>
          </View>

          {/* Activity Level Section */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>Activity Level</Text>
            <Text style={styles.cardSubtitle}>How active are you typically?</Text>
            <View style={styles.activityContainer}>
              {activityLevels.map((level) => (
                <Button
                  key={level.key}
                  mode={preferences.activityLevel === level.key ? 'contained' : 'outlined'}
                  onPress={() => setPreferences(prev => ({ ...prev, activityLevel: level.key }))}
                  style={[
                    styles.activityButton,
                    preferences.activityLevel === level.key && styles.selectedActivityButton
                  ]}
                  contentStyle={styles.activityButtonContent}
                  labelStyle={[
                    styles.activityButtonText,
                    preferences.activityLevel === level.key && styles.selectedActivityButtonText
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={level.icon} 
                      size={20} 
                      color={preferences.activityLevel === level.key ? '#000' : '#fff'} 
                    />
                  )}
                >
                  {level.label}
                </Button>
              ))}
            </View>
          </View>

          {/* Weather Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>Weather Preferences</Text>
            <Text style={styles.cardSubtitle}>What weather do you enjoy?</Text>
            <View style={styles.chipContainer}>
              {weatherPreferences.map((weather) => (
                <Chip
                  key={weather.key}
                  selected={preferences.weatherPreferences.includes(weather.key)}
                  onPress={() => handleWeatherPreferenceToggle(weather.key)}
                  style={[
                    styles.chip,
                    preferences.weatherPreferences.includes(weather.key) && styles.selectedChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    preferences.weatherPreferences.includes(weather.key) && styles.selectedChipText
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={weather.icon} 
                      size={16} 
                      color={preferences.weatherPreferences.includes(weather.key) ? '#000' : '#fff'} 
                    />
                  )}
                >
                  {weather.label}
                </Chip>
              ))}
            </View>
          </View>

          {/* Notification Settings Section */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>Notification Settings</Text>
            <Text style={styles.cardSubtitle}>What would you like to be notified about?</Text>
            <View style={styles.notificationContainer}>
              {Object.entries(preferences.notificationSettings).map(([key, value]) => (
                <Button
                  key={key}
                  mode={value ? 'contained' : 'outlined'}
                  onPress={() => handleNotificationToggle(key)}
                  style={[
                    styles.notificationButton,
                    value && styles.selectedNotificationButton
                  ]}
                  contentStyle={styles.notificationButtonContent}
                  labelStyle={[
                    styles.notificationButtonText,
                    value && styles.selectedNotificationButtonText
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={value ? 'check' : 'close'} 
                      size={16} 
                      color={value ? '#000' : '#fff'} 
                    />
                  )}
                >
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Button>
              ))}
            </View>
          </View>

          {/* Units and Theme Section */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>App Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Temperature Units</Text>
              <View style={styles.settingOptions}>
                <Button
                  mode={preferences.units === 'metric' ? 'contained' : 'outlined'}
                  onPress={() => setPreferences(prev => ({ ...prev, units: 'metric' }))}
                  style={styles.settingButton}
                >
                  °C
                </Button>
                <Button
                  mode={preferences.units === 'imperial' ? 'contained' : 'outlined'}
                  onPress={() => setPreferences(prev => ({ ...prev, units: 'imperial' }))}
                  style={styles.settingButton}
                >
                  °F
                </Button>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Theme</Text>
              <View style={styles.settingOptions}>
                <Button
                  mode={preferences.theme === 'auto' ? 'contained' : 'outlined'}
                  onPress={() => setPreferences(prev => ({ ...prev, theme: 'auto' }))}
                  style={styles.settingButton}
                >
                  Auto
                </Button>
                <Button
                  mode={preferences.theme === 'light' ? 'contained' : 'outlined'}
                  onPress={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                  style={styles.settingButton}
                >
                  Light
                </Button>
                <Button
                  mode={preferences.theme === 'dark' ? 'contained' : 'outlined'}
                  onPress={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                  style={styles.settingButton}
                >
                  Dark
                </Button>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonText}
            loading={loading}
            disabled={loading}
            icon="check"
          >
            Save Preferences
          </Button>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  titleLine1: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  titleLine2: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  titleLine3: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '300',
  },
  section: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: 'rgba(120,130,150,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
    borderRadius: 20,
  },
  selectedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activityContainer: {
    gap: 10,
  },
  activityButton: {
    borderColor: 'rgba(120,130,150,0.6)',
    borderWidth: 1,
    borderRadius: 20,
  },
  selectedActivityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  activityButtonContent: {
    paddingVertical: 8,
  },
  activityButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedActivityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  notificationButton: {
    borderColor: 'rgba(120,130,150,0.6)',
    borderWidth: 1,
    borderRadius: 20,
  },
  selectedNotificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  notificationButtonContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  notificationButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  selectedNotificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingButton: {
    borderColor: 'rgba(120,130,150,0.6)',
    borderWidth: 1,
    borderRadius: 20,
    minWidth: 60,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 20,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserPreferencesScreen;
