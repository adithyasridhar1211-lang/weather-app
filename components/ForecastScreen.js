import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, Title, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchWeatherData, fetchForecastData } from '../services/api';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const ForecastScreen = ({ city, onBack, devModeOverrides = null }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    loadForecastData();
  }, [city]);

  const loadForecastData = async () => {
    try {
      setLoading(true);
      console.log('Loading forecast data for city:', city);
      
      // Use real forecast API
      const forecast = await fetchForecastData(city);
      setForecastData(forecast);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      // Fallback to mock data if API fails
      const mockForecast = generateMockForecast();
      setForecastData(mockForecast);
    } finally {
      setLoading(false);
    }
  };

  const generateMockForecast = () => {
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const conditions = ['clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const baseTemp = 20 + Math.sin(i * 0.3) * 10; // Temperature variation
      const high = Math.round(baseTemp + Math.random() * 8);
      const low = Math.round(baseTemp - Math.random() * 8);
      
      forecast.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        condition: condition,
        description: getConditionDescription(condition),
        high: high,
        low: low,
        temperature: Math.round((high + low) / 2),
        humidity: Math.round(60 + Math.random() * 30),
        windSpeed: Math.round(5 + Math.random() * 15),
        pressure: Math.round(1010 + Math.random() * 20),
        uvIndex: Math.round(1 + Math.random() * 10),
        precipitation: Math.round(Math.random() * 80),
        visibility: Math.round(8 + Math.random() * 4),
        sunrise: getSunriseTime(date),
        sunset: getSunsetTime(date),
        hourly: generateHourlyData(condition, high, low),
      });
    }
    
    return forecast;
  };

  const getConditionDescription = (condition) => {
    const descriptions = {
      'clear': 'Clear sky',
      'clouds': 'Partly cloudy',
      'rain': 'Light rain',
      'snow': 'Light snow',
      'thunderstorm': 'Thunderstorm',
      'mist': 'Misty conditions',
    };
    return descriptions[condition] || 'Clear sky';
  };

  const getSunriseTime = (date) => {
    const hour = 6 + Math.random() * 2;
    const minute = Math.floor(Math.random() * 60);
    return `${Math.floor(hour).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getSunsetTime = (date) => {
    const hour = 18 + Math.random() * 2;
    const minute = Math.floor(Math.random() * 60);
    return `${Math.floor(hour).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const generateHourlyData = (condition, high, low) => {
    const hourly = [];
    for (let hour = 0; hour < 24; hour += 3) {
      const temp = low + (high - low) * Math.sin((hour - 6) * Math.PI / 12);
      hourly.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: Math.round(temp),
        condition: condition,
        precipitation: Math.random() * 20,
      });
    }
    return hourly;
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear': 'weather-sunny',
      'clouds': 'weather-cloudy',
      'rain': 'weather-rainy',
      'snow': 'weather-snowy',
      'thunderstorm': 'weather-lightning',
      'mist': 'weather-fog',
    };
    return iconMap[condition] || 'weather-sunny';
  };

  const getUVIndexColor = (uvIndex) => {
    if (uvIndex <= 2) return '#4CAF50'; // Green
    if (uvIndex <= 5) return '#FFEB3B'; // Yellow
    if (uvIndex <= 7) return '#FF9800'; // Orange
    if (uvIndex <= 10) return '#F44336'; // Red
    return '#9C27B0'; // Purple
  };

  const getUVIndexDescription = (uvIndex) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ImageBackground
          source={getBackgroundImage(null, devModeOverrides)}
          style={styles.backgroundImage}
          resizeMode="cover"
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading forecast...</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  const selectedDayData = forecastData[selectedDay];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={getBackgroundImage(null, devModeOverrides)}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Title style={styles.headerTitle}>6-Day Forecast</Title>
            <Text style={styles.headerSubtitle}>{city}</Text>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}
        >
          {forecastData.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.selectedDayButton
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[
                styles.dayButtonText,
                selectedDay === index && styles.selectedDayButtonText
              ]}>
                {day.day.substring(0, 3)}
              </Text>
              <Text style={[
                styles.dayButtonDate,
                selectedDay === index && styles.selectedDayButtonText
              ]}>
                {day.dateString}
              </Text>
              <MaterialCommunityIcons
                name={getWeatherIcon(day.condition)}
                size={20}
                color={selectedDay === index ? '#fff' : '#ccc'}
              />
              <Text style={[
                styles.dayButtonTemp,
                selectedDay === index && styles.selectedDayButtonText
              ]}>
                {day.high}°/{day.low}°
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Day Details */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Weather Card */}
          <Card style={styles.mainWeatherCard}>
            <Card.Content>
              <View style={styles.mainWeatherHeader}>
                <View style={styles.mainWeatherInfo}>
                  <Text style={styles.selectedDayName}>{selectedDayData.day}</Text>
                  <Text style={styles.selectedDateString}>{selectedDayData.dateString}</Text>
                  <View style={styles.temperatureRow}>
                    <MaterialCommunityIcons
                      name={getWeatherIcon(selectedDayData.condition)}
                      size={48}
                      color="#fff"
                    />
                    <View style={styles.temperatureInfo}>
                      <Text style={styles.mainTemperature}>{selectedDayData.temperature}°C</Text>
                      <Text style={styles.conditionDescription}>{selectedDayData.description}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.temperatureRange}>
                  <Text style={styles.highTemp}>H: {selectedDayData.high}°</Text>
                  <Text style={styles.lowTemp}>L: {selectedDayData.low}°</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Detailed Stats */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons name="water" size={24} color="#4CAF50" />
                <Text style={styles.statValue}>{selectedDayData.humidity}%</Text>
                <Text style={styles.statLabel}>Humidity</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons name="weather-windy" size={24} color="#2196F3" />
                <Text style={styles.statValue}>{selectedDayData.windSpeed} km/h</Text>
                <Text style={styles.statLabel}>Wind Speed</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons name="gauge" size={24} color="#FF9800" />
                <Text style={styles.statValue}>{selectedDayData.pressure} hPa</Text>
                <Text style={styles.statLabel}>Pressure</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons name="weather-sunny" size={24} color={getUVIndexColor(selectedDayData.uvIndex)} />
                <Text style={styles.statValue}>{selectedDayData.uvIndex}</Text>
                <Text style={styles.statLabel}>UV Index</Text>
                <Text style={[styles.uvDescription, { color: getUVIndexColor(selectedDayData.uvIndex) }]}>
                  {getUVIndexDescription(selectedDayData.uvIndex)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons name="weather-rainy" size={24} color="#03A9F4" />
                <Text style={styles.statValue}>{selectedDayData.precipitation}%</Text>
                <Text style={styles.statLabel}>Precipitation</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons name="eye" size={24} color="#9C27B0" />
                <Text style={styles.statValue}>{selectedDayData.visibility} km</Text>
                <Text style={styles.statLabel}>Visibility</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Sunrise/Sunset */}
          <Card style={styles.sunCard}>
            <Card.Content>
              <View style={styles.sunInfo}>
                <View style={styles.sunItem}>
                  <MaterialCommunityIcons name="weather-sunset-up" size={24} color="#FFC107" />
                  <View style={styles.sunDetails}>
                    <Text style={styles.sunTime}>{selectedDayData.sunrise}</Text>
                    <Text style={styles.sunLabel}>Sunrise</Text>
                  </View>
                </View>
                <View style={styles.sunItem}>
                  <MaterialCommunityIcons name="weather-sunset-down" size={24} color="#FF5722" />
                  <View style={styles.sunDetails}>
                    <Text style={styles.sunTime}>{selectedDayData.sunset}</Text>
                    <Text style={styles.sunLabel}>Sunset</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Hourly Forecast */}
          <Card style={styles.hourlyCard}>
            <Card.Content>
              <Title style={styles.hourlyTitle}>Hourly Forecast</Title>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.hourlyContainer}>
                  {selectedDayData.hourly.map((hour, index) => (
                    <View key={index} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>{hour.time}</Text>
                      <MaterialCommunityIcons
                        name={getWeatherIcon(hour.condition)}
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.hourlyTemp}>{hour.temperature}°</Text>
                      {hour.precipitation > 10 && (
                        <Text style={styles.hourlyPrecip}>{Math.round(hour.precipitation)}%</Text>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>
        </ScrollView>
      </ImageBackground>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(120,130,150,0.5)',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  daySelector: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 10,
  },
  daySelectorContent: {
    paddingHorizontal: 10,
  },
  dayButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(120,130,150,0.5)',
    minWidth: 70,
  },
  selectedDayButton: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  dayButtonText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  dayButtonDate: {
    color: '#999',
    fontSize: 10,
    marginBottom: 4,
  },
  dayButtonTemp: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  mainWeatherCard: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  mainWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainWeatherInfo: {
    flex: 1,
  },
  selectedDayName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedDateString: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 10,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureInfo: {
    marginLeft: 15,
  },
  mainTemperature: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  conditionDescription: {
    color: '#ccc',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  temperatureRange: {
    alignItems: 'flex-end',
  },
  highTemp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lowTemp: {
    color: '#ccc',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
    width: '48%',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  uvDescription: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sunCard: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  sunInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sunItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunDetails: {
    marginLeft: 10,
  },
  sunTime: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sunLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  hourlyCard: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  hourlyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  hourlyContainer: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 10,
    minWidth: 60,
  },
  hourlyTime: {
    color: '#ccc',
    fontSize: 10,
    marginBottom: 4,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  hourlyPrecip: {
    color: '#03A9F4',
    fontSize: 8,
    marginTop: 2,
  },
});

export default ForecastScreen;
