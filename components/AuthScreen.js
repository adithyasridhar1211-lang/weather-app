import React, { useState, useEffect } from 'react';
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
import { Text, TextInput, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { AuthService } from '../services/supabase';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const AuthScreen = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const city = reverseGeocode[0];
        setWeatherData({
          city: `${city.city}, ${city.region}`,
          temperature: 19,
          condition: 'Mostly Clear',
          high: 24,
          low: 18,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback weather data
      setWeatherData({
        city: 'Bangalore',
        temperature: 19,
        condition: 'Mostly Clear',
        high: 24,
        low: 18,
      });
    }
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      );

      if (result.success) {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => onAuthSuccess?.() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signIn(formData.email, formData.password);

      if (result.success) {
        onAuthSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'Failed to sign in');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    try {
      let result;
      if (provider === 'google') {
        result = await AuthService.signInWithGoogle();
      } else if (provider === 'apple') {
        result = await AuthService.signInWithApple();
      }

      if (result?.success) {
        onAuthSuccess?.();
      } else {
        Alert.alert('Error', result?.error || `Failed to sign in with ${provider}`);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
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
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Weather Display */}
          {weatherData && (
            <View style={styles.weatherContainer}>
              <View style={styles.weatherInfo}>
                <Text style={styles.cityName}>{weatherData.city}</Text>
                <Text style={styles.temperature}>{weatherData.temperature}°</Text>
                <Text style={styles.condition}>{weatherData.condition}</Text>
                <Text style={styles.highLow}>
                  H:{weatherData.high}° L:{weatherData.low}°
                </Text>
              </View>
            </View>
          )}

          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleLine1}>Plan your day</Text>
            <Text style={styles.titleLine2}>with precision</Text>
          </View>

          {/* Auth Tabs */}
          <View style={styles.tabContainer}>
            <Surface style={[styles.tab, isSignUp && styles.activeTab]}>
              <Button
                mode="text"
                onPress={() => setIsSignUp(true)}
                labelStyle={[styles.tabText, isSignUp && styles.activeTabText]}
              >
                Sign up
              </Button>
            </Surface>
            <Surface style={[styles.tab, !isSignUp && styles.activeTab]}>
              <Button
                mode="text"
                onPress={() => setIsSignUp(false)}
                labelStyle={[styles.tabText, !isSignUp && styles.activeTabText]}
              >
                Log in
              </Button>
            </Surface>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <Button
              mode="contained"
              onPress={() => handleSocialAuth('Apple')}
              style={styles.socialButton}
              contentStyle={styles.socialButtonContent}
              labelStyle={styles.socialButtonText}
              icon={() => <MaterialCommunityIcons name="apple" size={20} color="#000" />}
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Sign up with Apple'}
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleSocialAuth('Google')}
              style={styles.socialButton}
              contentStyle={styles.socialButtonContent}
              labelStyle={styles.socialButtonText}
              icon={() => <MaterialCommunityIcons name="google" size={20} color="#000" />}
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Sign up with Google'}
            </Button>
          </View>

          {/* OR Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {isSignUp && (
              <View style={styles.nameRow}>
                <TextInput
                  mode="outlined"
                  placeholder="First name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  style={styles.nameInput}
                  placeholderTextColor="#999"
                  theme={{
                    colors: {
                      primary: '#fff',
                      surface: 'rgba(120,130,150,0.4)',
                      onSurface: '#fff',
                    },
                  }}
                />
                <TextInput
                  mode="outlined"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  style={styles.nameInput}
                  placeholderTextColor="#999"
                  theme={{
                    colors: {
                      primary: '#fff',
                      surface: 'rgba(120,130,150,0.4)',
                      onSurface: '#fff',
                    },
                  }}
                />
              </View>
            )}
            
            <TextInput
              mode="outlined"
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              style={styles.emailInput}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{
                colors: {
                  primary: '#fff',
                  surface: 'rgba(120,130,150,0.4)',
                  onSurface: '#fff',
                },
              }}
            />
            
            <TextInput
              mode="outlined"
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              style={styles.passwordInput}
              placeholderTextColor="#999"
              secureTextEntry
              theme={{
                colors: {
                  primary: '#fff',
                  surface: 'rgba(120,130,150,0.4)',
                  onSurface: '#fff',
                },
              }}
            />
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={isSignUp ? handleSignUp : handleSignIn}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonText}
            disabled={loading}
            loading={loading}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign up' : 'Log in')}
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
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  weatherContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  weatherInfo: {
    alignItems: 'flex-end',
  },
  cityName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  temperature: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  condition: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  highLow: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  socialContainer: {
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 25,
  },
  socialButtonContent: {
    paddingVertical: 12,
  },
  socialButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  separatorText: {
    color: '#ccc',
    marginHorizontal: 15,
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  nameInput: {
    flex: 1,
      backgroundColor: 'rgba(120,130,150,0.5)',
  },
  emailInput: {
    marginBottom: 15,
      backgroundColor: 'rgba(120,130,150,0.5)',
  },
  passwordInput: {
      backgroundColor: 'rgba(120,130,150,0.5)',
  },
  submitButton: {
    backgroundColor: '#333',
    borderRadius: 25,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthScreen;