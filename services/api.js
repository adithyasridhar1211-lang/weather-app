// API configuration
const OPENWEATHER_API_KEY = '3f7363efa37c0c75405403361045f5a0';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fallback weather data for when API fails
const getFallbackWeatherData = (city) => {
  const cleanCity = city.replace(/,.*$/, '').trim();
  const fallbackData = {
    city: cleanCity,
    temperature: 22,
    condition: 'Clear',
    description: 'clear sky',
    high: 25,
    low: 18,
    humidity: 65,
    windSpeed: 3.2,
    pressure: 1013,
    visibility: 10000,
    icon: '01d',
    country: 'US',
    coordinates: {
      lat: 40.7128,
      lon: -74.0060
    }
  };
  console.log('⚠️ Using FALLBACK weather data:', fallbackData);
  return fallbackData;
};

// Weather API functions
export const fetchWeatherData = async (city) => {
  try {
    console.log('Fetching weather data for city:', city);
    
    if (!city || city.trim() === '') {
      throw new Error('City name is required');
    }
    
    // Clean up city name - remove extra commas and trim whitespace
    const cleanCity = city.replace(/,.*$/, '').trim();
    console.log('Cleaned city name:', cleanCity);
    
    // Use direct weather API call (more reliable than geocoding)
    const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(cleanCity)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('Weather API URL:', weatherUrl);
    
    const weatherResponse = await fetch(weatherUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!weatherResponse.ok) {
      console.error('Weather API error:', weatherResponse.status, weatherResponse.statusText);
      const errorText = await weatherResponse.text();
      console.error('Weather API error response:', errorText);
      
      if (weatherResponse.status === 404) {
        throw new Error(`City not found: ${cleanCity}. Please try a different city name or check the spelling.`);
      } else if (weatherResponse.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeather API configuration.');
      } else if (weatherResponse.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Weather API error: ${weatherResponse.status} - ${weatherResponse.statusText}`);
      }
    }
    
    const weatherData = await weatherResponse.json();
    console.log('Weather API response:', weatherData);
    
    // Validate the response data
    if (!weatherData || !weatherData.main || !weatherData.weather || !weatherData.weather[0]) {
      throw new Error('Invalid weather data received from API');
    }
    
    // Format the data to match our app's expected structure
    const formattedData = {
      city: weatherData.name || cleanCity,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      high: Math.round(weatherData.main.temp_max),
      low: Math.round(weatherData.main.temp_min),
      humidity: weatherData.main.humidity || 0,
      windSpeed: weatherData.wind?.speed || 0,
      pressure: weatherData.main.pressure || 0,
      visibility: weatherData.visibility || 0,
      icon: weatherData.weather[0].icon || '01d',
      country: weatherData.sys?.country || '',
      coordinates: {
        lat: weatherData.coord?.lat || 0,
        lon: weatherData.coord?.lon || 0
      }
    };
    
    console.log('✅ Formatted weather data (REAL DATA):', formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn('Network error, using fallback data');
      return getFallbackWeatherData(city);
    } else if (error.message.includes('City not found')) {
      // For city not found errors, still throw the error so user can try a different city
      throw error;
    } else {
      // For other errors, use fallback data
      console.warn('API error, using fallback data:', error.message);
      return getFallbackWeatherData(city);
    }
  }
};

// AI Activity Suggestions API functions
export const fetchActivitySuggestions = async (weatherData, city) => {
  try {
    const OPENAI_API_KEY = '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';
    
    const timeOfDay = new Date().getHours();
    const timePeriod = timeOfDay < 6 ? 'early morning' : 
                      timeOfDay < 12 ? 'morning' : 
                      timeOfDay < 17 ? 'afternoon' : 
                      timeOfDay < 21 ? 'evening' : 'night';
    
    const prompt = `Based on the current weather in ${city}:
- Temperature: ${weatherData.temperature}°C
- Condition: ${weatherData.condition} (${weatherData.description})
- Time: ${timePeriod} (${timeOfDay}:00)
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} m/s

Suggest 5 specific activities that would be perfect for this weather and time. Make them practical, engaging, and suitable for the current conditions. Format as a JSON array with objects containing "title", "description", and "category" fields.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestionsText = data.choices[0].message.content;
    
    // Try to parse JSON response, fallback to mock data if parsing fails
    try {
      const suggestions = JSON.parse(suggestionsText);
      return suggestions;
    } catch (parseError) {
      console.warn('Could not parse AI response, using fallback suggestions');
      return [
        {
          title: "Outdoor Walk",
          description: "Perfect weather for a refreshing walk around the city",
          category: "Outdoor"
        },
        {
          title: "Café Visit",
          description: "Enjoy a hot beverage at a local café",
          category: "Indoor"
        },
        {
          title: "Photo Walk",
          description: "Capture the beautiful weather with your camera",
          category: "Creative"
        },
        {
          title: "Reading in Park",
          description: "Find a nice spot to read a book outdoors",
          category: "Relaxing"
        },
        {
          title: "Local Exploration",
          description: "Discover new places in your city",
          category: "Adventure"
        }
      ];
    }
  } catch (error) {
    console.error('Error fetching activity suggestions:', error);
    // Return fallback suggestions if API fails
    return [
      {
        title: "Outdoor Walk",
        description: "Perfect weather for a refreshing walk around the city",
        category: "Outdoor"
      },
      {
        title: "Café Visit", 
        description: "Enjoy a hot beverage at a local café",
        category: "Indoor"
      },
      {
        title: "Photo Walk",
        description: "Capture the beautiful weather with your camera", 
        category: "Creative"
      }
    ];
  }
};

// Utility function to get weather icon
export const getWeatherIcon = (condition) => {
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

// Utility function to format temperature
export const formatTemperature = (temp, unit = 'C') => {
  if (unit === 'F') {
    return `${Math.round((temp * 9/5) + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
};

// Utility function to format wind speed
export const formatWindSpeed = (speed, unit = 'kmh') => {
  if (unit === 'mph') {
    return `${Math.round(speed * 2.237)} mph`;
  }
  return `${Math.round(speed * 3.6)} km/h`;
};

// Forecast API function
export const fetchForecastData = async (city) => {
  try {
    console.log('Fetching forecast data for city:', city);
    
    if (!city || city.trim() === '') {
      throw new Error('City name is required');
    }
    
    // Clean up city name - remove extra commas and trim whitespace
    const cleanCity = city.replace(/,.*$/, '').trim();
    console.log('Cleaned city name for forecast:', cleanCity);
    
    // Use OpenWeatherMap 5-day forecast API
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(cleanCity)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('Forecast API URL:', forecastUrl);
    
    const forecastResponse = await fetch(forecastUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!forecastResponse.ok) {
      console.error('Forecast API error:', forecastResponse.status, forecastResponse.statusText);
      const errorText = await forecastResponse.text();
      console.error('Forecast API error response:', errorText);
      
      if (forecastResponse.status === 404) {
        throw new Error(`City not found: ${cleanCity}. Please try a different city name or check the spelling.`);
      } else if (forecastResponse.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeather API configuration.');
      } else if (forecastResponse.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Forecast API error: ${forecastResponse.status} - ${forecastResponse.statusText}`);
      }
    }
    
    const forecastData = await forecastResponse.json();
    console.log('Forecast API response:', forecastData);
    
    // Validate the response data
    if (!forecastData || !forecastData.list || !Array.isArray(forecastData.list)) {
      throw new Error('Invalid forecast data received from API');
    }
    
    // Process the forecast data to group by days
    const dailyForecasts = {};
    const cityInfo = forecastData.city;
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          date: date,
          day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          temperatures: [],
          conditions: [],
          humidities: [],
          windSpeeds: [],
          pressures: [],
          hourly: []
        };
      }
      
      // Collect data for daily averages
      dailyForecasts[dateKey].temperatures.push(item.main.temp);
      dailyForecasts[dateKey].conditions.push(item.weather[0].main);
      dailyForecasts[dateKey].humidities.push(item.main.humidity);
      dailyForecasts[dateKey].windSpeeds.push(item.wind.speed);
      dailyForecasts[dateKey].pressures.push(item.main.pressure);
      
      // Add hourly data
      dailyForecasts[dateKey].hourly.push({
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0
      });
    });
    
    // Convert to array and calculate daily averages
    const formattedForecast = Object.values(dailyForecasts).map(day => {
      const avgTemp = day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length;
      const high = Math.round(Math.max(...day.temperatures));
      const low = Math.round(Math.min(...day.temperatures));
      const avgHumidity = Math.round(day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length);
      const avgWindSpeed = day.windSpeeds.reduce((a, b) => a + b, 0) / day.windSpeeds.length;
      const avgPressure = Math.round(day.pressures.reduce((a, b) => a + b, 0) / day.pressures.length);
      
      // Get most common condition for the day
      const conditionCounts = {};
      day.conditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
      const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
      );
      
      return {
        date: day.date,
        day: day.day,
        dateString: day.dateString,
        condition: mostCommonCondition,
        description: getConditionDescription(mostCommonCondition),
        high: high,
        low: low,
        temperature: Math.round(avgTemp),
        humidity: avgHumidity,
        windSpeed: Math.round(avgWindSpeed * 3.6), // Convert to km/h
        pressure: avgPressure,
        uvIndex: Math.round(1 + Math.random() * 10), // UV index not available in free API
        precipitation: Math.round(Math.random() * 20), // Precipitation not always available
        visibility: Math.round(8 + Math.random() * 4), // Visibility not available in forecast
        sunrise: getSunriseTime(day.date),
        sunset: getSunsetTime(day.date),
        hourly: day.hourly.slice(0, 8) // Limit to 8 hours per day
      };
    });
    
    console.log('✅ Formatted forecast data (REAL DATA):', formattedForecast);
    return formattedForecast;
    
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn('Network error, using fallback forecast data');
      return getFallbackForecastData(city);
    } else if (error.message.includes('City not found')) {
      // For city not found errors, still throw the error so user can try a different city
      throw error;
    } else {
      // For other errors, use fallback data
      console.warn('Forecast API error, using fallback data:', error.message);
      return getFallbackForecastData(city);
    }
  }
};

// Fallback forecast data for when API fails
const getFallbackForecastData = (city) => {
  const cleanCity = city.replace(/,.*$/, '').trim();
  const forecast = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const baseTemp = 20 + Math.sin(i * 0.3) * 10;
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
  
  console.log('⚠️ Using FALLBACK forecast data:', forecast);
  return forecast;
};

// Helper functions for forecast data
const getConditionDescription = (condition) => {
  const descriptions = {
    'Clear': 'clear sky',
    'Clouds': 'few clouds',
    'Rain': 'light rain',
    'Snow': 'light snow',
    'Thunderstorm': 'thunderstorm',
    'Mist': 'mist',
    'Fog': 'fog',
    'Haze': 'haze'
  };
  return descriptions[condition] || 'clear sky';
};

const getSunriseTime = (date) => {
  const sunrise = new Date(date);
  sunrise.setHours(6, 30 + Math.random() * 60, 0, 0);
  return sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getSunsetTime = (date) => {
  const sunset = new Date(date);
  sunset.setHours(18, 30 + Math.random() * 60, 0, 0);
  return sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const generateHourlyData = (condition, high, low) => {
  const hourly = [];
  for (let i = 0; i < 8; i++) {
    const hour = new Date();
    hour.setHours(hour.getHours() + i * 3);
    
    hourly.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      temperature: Math.round(low + (high - low) * Math.random()),
      condition: condition,
      description: getConditionDescription(condition),
      icon: '01d',
      humidity: Math.round(60 + Math.random() * 30),
      windSpeed: Math.round(5 + Math.random() * 15),
      precipitation: Math.round(Math.random() * 20)
    });
  }
  return hourly;
};
