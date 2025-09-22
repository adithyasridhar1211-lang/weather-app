import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WeatherCard = ({ weatherData, city, loading }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (!weatherData) return null;

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

  const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
  };

  const formatWindSpeed = (speed) => {
    return `${Math.round(speed * 3.6)} km/h`;
  };

  const formatTime = (date) => {
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const [hours, minutes] = timeString.split(':');
    return { hours, minutes };
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const time = formatTime(currentTime);
  const dateString = formatDate(currentTime);
  const [day, month, dayNum] = dateString.split(' ');

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Title style={styles.cityName}>{weatherData.city}</Title>
      </View>
      
      {/* Main Content Section */}
      <View style={styles.mainContent}>
        <View style={styles.timeTemperatureRow}>
          <View style={styles.timeContainer}>
            <View style={styles.timeDateGroup}>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeTop}>{time.hours}</Text>
                <Text style={styles.timeBottom}>{time.minutes}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.monthText}>{month}</Text>
                <Text style={styles.dayNumText}>{dayNum}</Text>
              </View>
            </View>
          </View>
          <View style={styles.weatherGroup}>
            <View style={styles.temperatureContainer}>
              <Title style={styles.temperature}>
                {weatherData.temperature}°C
              </Title>
              <Paragraph style={styles.description}>
                {weatherData.description}
              </Paragraph>
            </View>
            <MaterialCommunityIcons
              name={getWeatherIcon(weatherData.condition)}
              size={48}
              color="#fff"
              style={styles.weatherIcon}
            />
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="thermometer" size={20} color="#fff" />
          <Paragraph style={styles.detailText}>
            High {weatherData.high}°C / Low {weatherData.low}°C
          </Paragraph>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="water" size={20} color="#fff" />
          <Paragraph style={styles.detailText}>
            Humidity {weatherData.humidity}%
          </Paragraph>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="weather-windy" size={20} color="#fff" />
          <Paragraph style={styles.detailText}>
            Wind {Math.round(weatherData.windSpeed * 3.6)} km/h
          </Paragraph>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="gauge" size={20} color="#fff" />
          <Paragraph style={styles.detailText}>
            Pressure {weatherData.pressure} hPa
          </Paragraph>
        </View>
      </View>
    </View>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  mainContent: {
    marginBottom: 25,
  },
  timeTemperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeContainer: {
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 30,
  },
  timeDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDisplay: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginRight: 15,
  },
  timeTop: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    lineHeight: 40,
  },
  timeBottom: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    lineHeight: 40,
  },
  dateContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65, // Match the height of time container (2 * 40px line height)
  },
  dayText: {
    fontSize: 14,
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 14,
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  dayNumText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  weatherGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  temperatureContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  temperature: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    textTransform: 'capitalize',
    color: '#ccc',
    textAlign: 'center',
  },
  weatherIcon: {
    marginLeft: 5,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
  },
});

export default WeatherCard;