import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ImageBackground, Dimensions, Text, BackHandler, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Location from 'expo-location';

import AuthScreen from './components/AuthScreen';
import PersonalDetailsScreen from './components/PersonalDetailsScreen';
import UserPreferencesScreen from './components/UserPreferencesScreen';
import LocationSelectionScreen from './components/LocationSelectionScreen';
import WeatherCard from './components/WeatherCard';
import ActivitySuggestions from './components/ActivitySuggestions';
import WeeklyForecast from './components/WeeklyForecast';
import ActivityChatScreen from './components/ActivityChatScreen';
import CalendarCard from './components/CalendarCard';
import CalendarScreen from './components/CalendarScreen';
import ForecastScreen from './components/ForecastScreen';
import DevMenuScreen from './components/DevMenuScreen';
import { fetchWeatherData, fetchActivitySuggestions } from './services/api';
import { AuthService } from './services/supabase';
import { getBackgroundImage } from './utils/backgroundUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personalDetailsComplete, setPersonalDetailsComplete] = useState(false);
  const [preferencesComplete, setPreferencesComplete] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [activitySuggestions, setActivitySuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showChatScreen, setShowChatScreen] = useState(false);
  const [showCalendarScreen, setShowCalendarScreen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showForecastScreen, setShowForecastScreen] = useState(false);
  const [showDevMenuScreen, setShowDevMenuScreen] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0, total: 0 });
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Development mode state
  const [devMode, setDevMode] = useState(false);
  const [weatherOverride, setWeatherOverride] = useState(null);
  const [timeOverride, setTimeOverride] = useState(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [lastCalendarUpdate, setLastCalendarUpdate] = useState(0);

  // Initialize authentication state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await AuthService.isAuthenticated();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);



  // Check personal details completion when authenticated
  useEffect(() => {
    const checkPersonalDetailsStatus = async () => {
      if (isAuthenticated && !isInitializing) {
        try {
          const hasCompleted = await AuthService.hasCompletedPersonalDetails();
          setPersonalDetailsComplete(hasCompleted);
        } catch (error) {
          console.error('Error checking personal details status:', error);
          // Default to showing personal details if we can't check
          setPersonalDetailsComplete(false);
        }
      } else if (!isAuthenticated) {
        // Reset personal details status when not authenticated
        setPersonalDetailsComplete(false);
      }
    };

    checkPersonalDetailsStatus();
  }, [isAuthenticated, isInitializing]);

  // Check preferences completion when authenticated and personal details complete
  useEffect(() => {
    const checkPreferencesStatus = async () => {
      if (isAuthenticated && personalDetailsComplete && !isInitializing) {
        try {
          const hasCompleted = await AuthService.hasCompletedPreferences();
          setPreferencesComplete(hasCompleted);
        } catch (error) {
          console.error('Error checking preferences status:', error);
          // Default to showing preferences if we can't check
          setPreferencesComplete(false);
        }
      } else if (!isAuthenticated || !personalDetailsComplete) {
        // Reset preferences status when not authenticated or personal details not complete
        setPreferencesComplete(false);
      }
    };

    checkPreferencesStatus();
  }, [isAuthenticated, personalDetailsComplete, isInitializing]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (showChatScreen) {
        // If in chat screen, go back to main weather screen
        setShowChatScreen(false);
        return true; // Prevent default behavior
      } else if (showCalendarScreen) {
        // If in calendar screen, go back to main weather screen
        setShowCalendarScreen(false);
        return true; // Prevent default behavior
      } else if (showForecastScreen) {
        // If in forecast screen, go back to main weather screen
        setShowForecastScreen(false);
        return true; // Prevent default behavior
      } else {
        // For all other screens, log out and go to auth screen
        setIsAuthenticated(false);
        setPersonalDetailsComplete(false);
        setLocationSelected(false);
        setSelectedLocation(null);
        setWeatherData(null);
        setActivitySuggestions(null);
        setSelectedCity(null);
        setShowChatScreen(false);
        setShowCalendarScreen(false);
        setShowForecastScreen(false);
        setTokenUsage({ prompt: 0, completion: 0, total: 0 });
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [showChatScreen, showCalendarScreen, showForecastScreen, locationSelected, personalDetailsComplete, isAuthenticated]);

  const loadWeatherData = async (city = selectedCity) => {
    if (!city) return;

    setLoading(true);
    try {
      const weather = await fetchWeatherData(city);
      setWeatherData(weather);

      // Get AI activity suggestions
      const suggestions = await fetchActivitySuggestions(weather, city);
      setActivitySuggestions(suggestions);
    } catch (error) {
      console.error('Error loading weather data:', error);
      const errorMessage = error.message.includes('City not found') 
        ? `City not found: ${city}. Please try a different city name or check the spelling.`
        : `Could not load weather data: ${error.message}`;
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handlePersonalDetailsComplete = () => {
    setPersonalDetailsComplete(true);
    // The preferences check will be triggered by the useEffect
  };

  const handlePreferencesComplete = () => {
    setPreferencesComplete(true);
  };

  const handleLocationSelectionComplete = (location) => {
    setSelectedLocation(location);
    setLocationSelected(true);
    setSelectedCity(location);
    // Load weather data immediately after location selection
    loadWeatherData(location);
  };

  const handleChatPress = (activity) => {
    setShowChatScreen(true);
    // Store the activity data for the chat screen
    if (activity) {
      setSelectedActivity(activity);
    }
  };

  const handleBackFromChat = () => {
    setShowChatScreen(false);
  };

  const handleCalendarPress = () => {
    setShowCalendarScreen(true);
  };

  const handleBackFromCalendar = () => {
    setShowCalendarScreen(false);
  };

  const handleForecastPress = () => {
    setShowForecastScreen(true);
  };

  const handleBackFromForecast = () => {
    setShowForecastScreen(false);
  };

  const handleDevMenuPress = () => {
    setShowDevMenuScreen(true);
  };

  const handleBackFromDevMenu = () => {
    setShowDevMenuScreen(false);
  };

  // Development mode handlers
  const handleDevModeToggle = (enabled) => {
    setDevMode(enabled);
    if (!enabled) {
      setWeatherOverride(null);
      setTimeOverride(null);
    }
  };

  const handleWeatherOverride = (weather) => {
    setWeatherOverride(weather);
  };

  const handleTimeOverride = (time) => {
    setTimeOverride(time);
  };

  const handleCalendarRefresh = () => {
    console.log('handleCalendarRefresh called, updating last calendar update timestamp');
    const timestamp = Date.now();
    setLastCalendarUpdate(timestamp);
    setCalendarRefreshKey(prev => {
      const newKey = prev + 1;
      console.log('Calendar refresh key updated to:', newKey);
      return newKey;
    });
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <PaperProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PaperProvider>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </PaperProvider>
    );
  }

  // Show personal details screen if authenticated but details not complete
  if (isAuthenticated && !personalDetailsComplete) {
    return (
      <PaperProvider>
        <PersonalDetailsScreen onComplete={handlePersonalDetailsComplete} />
      </PaperProvider>
    );
  }

  // Show preferences screen if personal details complete but preferences not complete
  if (isAuthenticated && personalDetailsComplete && !preferencesComplete) {
    return (
      <PaperProvider>
        <UserPreferencesScreen onComplete={handlePreferencesComplete} />
      </PaperProvider>
    );
  }

  // Show location selection screen if personal details and preferences complete but location not selected
  if (isAuthenticated && personalDetailsComplete && preferencesComplete && !locationSelected) {
    return (
      <PaperProvider>
        <LocationSelectionScreen onComplete={handleLocationSelectionComplete} />
      </PaperProvider>
    );
  }

  // Show chat screen if chat is active
  if (showChatScreen) {
    return (
      <PaperProvider>
        <ActivityChatScreen
          weatherData={weatherData}
          city={selectedCity}
          selectedActivity={selectedActivity}
          onBack={handleBackFromChat}
          devModeOverrides={{ weatherOverride, timeOverride }}
          onCalendarRefresh={handleCalendarRefresh}
        />
      </PaperProvider>
    );
  }

  // Show calendar screen if calendar is active
  if (showCalendarScreen) {
    return (
      <PaperProvider>
        <CalendarScreen
          onBack={handleBackFromCalendar}
          devModeOverrides={{ weatherOverride, timeOverride }}
          refreshKey={calendarRefreshKey}
          lastUpdate={lastCalendarUpdate}
        />
      </PaperProvider>
    );
  }

  // Show forecast screen if forecast is active
  if (showForecastScreen) {
    return (
      <PaperProvider>
        <ForecastScreen
          city={selectedCity}
          onBack={handleBackFromForecast}
          devModeOverrides={{ weatherOverride, timeOverride }}
        />
      </PaperProvider>
    );
  }

  // Show dev menu screen if dev menu is active
  if (showDevMenuScreen) {
    return (
      <PaperProvider>
        <DevMenuScreen
          onBack={handleBackFromDevMenu}
          onDevModeToggle={handleDevModeToggle}
          onWeatherOverride={handleWeatherOverride}
          onTimeOverride={handleTimeOverride}
          devMode={devMode}
          weatherOverride={weatherOverride}
          timeOverride={timeOverride}
        />
      </PaperProvider>
    );
  }

  // Show main weather app if all steps complete
  if (isAuthenticated && personalDetailsComplete && preferencesComplete && locationSelected) {
    return (
      <PaperProvider>
      <ImageBackground
        source={getBackgroundImage(weatherData, { weatherOverride, timeOverride })}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {weatherData && (
            <WeatherCard
              weatherData={weatherData}
              city={selectedCity}
              loading={loading}
            />
          )}
          
          <WeeklyForecast forecastData={weatherData} onPress={handleForecastPress} />
          
          {activitySuggestions && (
            <ActivitySuggestions
              suggestions={activitySuggestions}
              weatherData={weatherData}
              onChatPress={handleChatPress}
            />
          )}
          
          <CalendarCard onPress={handleCalendarPress} />
          
          {/* Development Menu Card */}
          <View style={styles.devMenuCard}>
            <TouchableOpacity onPress={handleDevMenuPress} style={styles.devMenuButton}>
              <MaterialCommunityIcons name="developer-board" size={24} color="#fff" />
              <Text style={styles.devMenuText}>Development Menu</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </ScrollView>
        </ImageBackground>
      </PaperProvider>
    );
  }

  // Fallback - should not reach here
  return (
    <PaperProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  devMenuCard: {
    backgroundColor: 'rgba(120,130,150,0.25)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  devMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  devMenuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
});
