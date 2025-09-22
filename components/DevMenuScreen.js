import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ImageBackground,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Title, Card, Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBackgroundImage } from '../utils/backgroundUtils';

const DevMenuScreen = ({ onBack, onDevModeToggle, onWeatherOverride, onTimeOverride, devMode, weatherOverride, timeOverride }) => {
  const [localDevMode, setLocalDevMode] = useState(devMode);
  const [localWeatherOverride, setLocalWeatherOverride] = useState(weatherOverride);
  const [localTimeOverride, setLocalTimeOverride] = useState(timeOverride);

  const weatherOptions = [
    { key: 'clear', label: 'Clear', icon: 'weather-sunny' },
    { key: 'cloudy', label: 'Cloudy', icon: 'weather-cloudy' },
    { key: 'rainy', label: 'Rainy', icon: 'weather-rainy' },
    { key: 'snowy', label: 'Snowy', icon: 'weather-snowy' },
    { key: 'stormy', label: 'Stormy', icon: 'weather-lightning' }
  ];

  const timeOptions = [
    { key: 'dawn', label: 'Dawn (5-7 AM)', icon: 'weather-sunset-up' },
    { key: 'morning', label: 'Morning (7-11 AM)', icon: 'weather-sunny' },
    { key: 'afternoon', label: 'Afternoon (11 AM-5 PM)', icon: 'weather-sunny' },
    { key: 'evening', label: 'Evening (5-8 PM)', icon: 'weather-sunset' },
    { key: 'night', label: 'Night (8 PM-5 AM)', icon: 'weather-night' }
  ];

  const handleDevModeToggle = (value) => {
    setLocalDevMode(value);
    onDevModeToggle(value);
  };

  const handleWeatherSelect = (weather) => {
    setLocalWeatherOverride(weather);
    onWeatherOverride(weather);
  };

  const handleTimeSelect = (time) => {
    setLocalTimeOverride(time);
    onTimeOverride(time);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Development Settings',
      'This will reset all development overrides and disable development mode. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setLocalDevMode(false);
            setLocalWeatherOverride(null);
            setLocalTimeOverride(null);
            onDevModeToggle(false);
            onWeatherOverride(null);
            onTimeOverride(null);
          }
        }
      ]
    );
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Title style={styles.headerTitle}>Development Menu</Title>
            <View style={styles.headerSpacer} />
          </View>

          {/* Development Mode Toggle */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleInfo}>
                  <Title style={styles.cardTitle}>Development Mode</Title>
                  <Text style={styles.cardDescription}>
                    Enable to override weather and time settings for testing
                  </Text>
                </View>
                <Switch
                  value={localDevMode}
                  onValueChange={handleDevModeToggle}
                  trackColor={{ false: 'rgba(120,130,150,0.3)', true: 'rgba(120,130,150,0.6)' }}
                  thumbColor={localDevMode ? '#fff' : 'rgba(120,130,150,0.8)'}
                />
              </View>
            </Card.Content>
          </Card>

          {localDevMode && (
            <>
              {/* Weather Override */}
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.cardTitle}>Weather Override</Title>
                  <Text style={styles.cardDescription}>
                    Select weather condition to test different backgrounds
                  </Text>
                  <View style={styles.optionsContainer}>
                    {weatherOptions.map((option) => (
                      <Chip
                        key={option.key}
                        selected={localWeatherOverride === option.key}
                        onPress={() => handleWeatherSelect(option.key)}
                        style={[
                          styles.chip,
                          localWeatherOverride === option.key && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          localWeatherOverride === option.key && styles.selectedChipText
                        ]}
                        icon={() => (
                          <MaterialCommunityIcons 
                            name={option.icon} 
                            size={16} 
                            color={localWeatherOverride === option.key ? '#000' : '#fff'} 
                          />
                        )}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </View>
                </Card.Content>
              </Card>

              {/* Time Override */}
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.cardTitle}>Time of Day Override</Title>
                  <Text style={styles.cardDescription}>
                    Select time of day to test different backgrounds
                  </Text>
                  <View style={styles.optionsContainer}>
                    {timeOptions.map((option) => (
                      <Chip
                        key={option.key}
                        selected={localTimeOverride === option.key}
                        onPress={() => handleTimeSelect(option.key)}
                        style={[
                          styles.chip,
                          localTimeOverride === option.key && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          localTimeOverride === option.key && styles.selectedChipText
                        ]}
                        icon={() => (
                          <MaterialCommunityIcons 
                            name={option.icon} 
                            size={16} 
                            color={localTimeOverride === option.key ? '#000' : '#fff'} 
                          />
                        )}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </View>
                </Card.Content>
              </Card>

              {/* Current Override Status */}
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.cardTitle}>Current Overrides</Title>
                  <View style={styles.statusContainer}>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Weather:</Text>
                      <Text style={styles.statusValue}>
                        {localWeatherOverride ? weatherOptions.find(w => w.key === localWeatherOverride)?.label : 'None'}
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Time:</Text>
                      <Text style={styles.statusValue}>
                        {localTimeOverride ? timeOptions.find(t => t.key === localTimeOverride)?.label : 'None'}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* Reset Button */}
              <Button
                mode="outlined"
                onPress={handleReset}
                style={styles.resetButton}
                labelStyle={styles.resetButtonText}
                icon="refresh"
              >
                Reset All Settings
              </Button>
            </>
          )}

          {/* Instructions */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>How to Use</Title>
              <Text style={styles.instructionText}>
                1. Enable Development Mode to access override controls{'\n'}
                2. Select weather condition to test weather-specific backgrounds{'\n'}
                3. Select time of day to test time-based backgrounds{'\n'}
                4. Navigate between screens to see the changes{'\n'}
                5. Use Reset to clear all overrides
              </Text>
            </Card.Content>
          </Card>
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
  },
  backgroundImageStyle: {
    opacity: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSpacer: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(120,130,150,0.25)',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(120,130,150,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedChip: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  chipText: {
    color: '#fff',
  },
  selectedChipText: {
    color: '#000',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statusValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetButton: {
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#fff',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DevMenuScreen;
