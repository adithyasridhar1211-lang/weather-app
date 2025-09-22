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
import { Text, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import LocationSelector from './LocationSelector';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const LocationSelectionScreen = ({ onComplete }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for weather data');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleContinue = () => {
    if (!selectedLocation) {
      Alert.alert('Location Required', 'Please select a location to continue');
      return;
    }
    console.log('Selected location:', selectedLocation);
    onComplete?.(selectedLocation);
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
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleLine1}>Plan your day</Text>
            <Text style={styles.titleLine2}>with precision</Text>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select your location</Text>
            <Text style={styles.sectionSubtitle}>We'll load your weather data and activity suggestions</Text>
          </View>

          {/* Location Selector Component */}
          <View style={styles.locationSelectorContainer}>
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              currentLocation={currentLocation}
              selectedCity={selectedLocation}
            />
          </View>

          {/* Continue Button */}
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.continueButtonContent}
            labelStyle={styles.continueButtonText}
          >
            Load Weather Data
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
  locationSelectorContainer: {
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  continueButtonContent: {
    paddingVertical: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationSelectionScreen;
