import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WeeklyForecast = ({ forecastData, onPress }) => {
  if (!forecastData) return null;

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear': 'weather-sunny',
      'clouds': 'weather-cloudy',
      'rain': 'weather-rainy',
      'snow': 'weather-snowy',
      'thunderstorm': 'weather-lightning',
      'mist': 'weather-fog',
      'fog': 'weather-fog',
      'haze': 'weather-hazy',
    };
    
    const conditionKey = condition.toLowerCase();
    return iconMap[conditionKey] || 'weather-sunny';
  };

  const formatDay = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(date).getDay()];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Mock forecast data for now - in a real app, this would come from the API
  const mockForecast = [
    { day: 'Today', date: new Date(), condition: 'Clear', high: 25, low: 18, icon: 'weather-sunny' },
    { day: 'Tomorrow', date: new Date(Date.now() + 86400000), condition: 'Clouds', high: 23, low: 16, icon: 'weather-cloudy' },
    { day: 'Wed', date: new Date(Date.now() + 172800000), condition: 'Rain', high: 20, low: 14, icon: 'weather-rainy' },
    { day: 'Thu', date: new Date(Date.now() + 259200000), condition: 'Clear', high: 24, low: 17, icon: 'weather-sunny' },
    { day: 'Fri', date: new Date(Date.now() + 345600000), condition: 'Clouds', high: 22, low: 15, icon: 'weather-cloudy' },
    { day: 'Sat', date: new Date(Date.now() + 432000000), condition: 'Rain', high: 19, low: 13, icon: 'weather-rainy' },
    { day: 'Sun', date: new Date(Date.now() + 518400000), condition: 'Clear', high: 26, low: 19, icon: 'weather-sunny' },
  ];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-week" size={24} color="#fff" />
        <Title style={styles.title}>7-Day Forecast</Title>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.forecastContainer}>
          {mockForecast.map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.dayText}>{day.day}</Text>
              <Text style={styles.dateText}>{formatDate(day.date)}</Text>
              <MaterialCommunityIcons
                name={getWeatherIcon(day.condition)}
                size={32}
                color="#fff"
                style={styles.weatherIcon}
              />
              <Text style={styles.conditionText}>{day.condition}</Text>
              <View style={styles.tempContainer}>
                <Text style={styles.highTemp}>{day.high}°</Text>
                <Text style={styles.lowTemp}>{day.low}°</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  forecastContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  forecastItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
    minWidth: 100,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  weatherIcon: {
    marginBottom: 8,
  },
  conditionText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highTemp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  lowTemp: {
    color: '#ccc',
    fontSize: 14,
  },
});

export default WeeklyForecast;
