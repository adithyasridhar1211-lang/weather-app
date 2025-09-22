// Utility to get the appropriate background based on time of day and weather
export const getTimeBasedBackground = (timeOverride = null) => {
  // Use override if provided, otherwise use current time
  if (timeOverride) {
    return timeOverride;
  }
  
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night'; // 8 PM - 5 AM
};

// Get weather condition category from weather data
export const getWeatherCondition = (weatherData, weatherOverride = null) => {
  // Use override if provided
  if (weatherOverride) {
    return weatherOverride;
  }
  
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
    return 'default';
  }
  
  const condition = weatherData.weather[0].main.toLowerCase();
  
  // Map weather conditions to our available weather folders
  if (condition.includes('cloud') || condition.includes('overcast')) {
    return 'cloudy';
  }
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    return 'rainy';
  }
  if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('sleet')) {
    return 'snowy';
  }
  if (condition.includes('storm') || condition.includes('thunder') || condition.includes('lightning')) {
    return 'stormy';
  }
  
  return 'default'; // For clear, sunny, etc. - use default backgrounds
};

export const getBackgroundImage = (weatherData = null, devModeOverrides = null) => {
  const timeOverride = devModeOverrides?.timeOverride || null;
  const weatherOverride = devModeOverrides?.weatherOverride || null;
  
  const timeOfDay = getTimeBasedBackground(timeOverride);
  const weatherCondition = getWeatherCondition(weatherData, weatherOverride);
  
  // Default backgrounds (no weather-specific folder)
  const defaultBackgrounds = {
    dawn: require('../assets/backgrounds/dawn.png'),
    morning: require('../assets/backgrounds/morning.png'),
    afternoon: require('../assets/backgrounds/afternoon.png'),
    evening: require('../assets/backgrounds/evening.png'),
    night: require('../assets/backgrounds/night.png')
  };
  
  // Weather-specific backgrounds
  const cloudyBackgrounds = {
    dawn: require('../assets/backgrounds/weather-bg/cloudy/cloudy dawn.png'),
    morning: require('../assets/backgrounds/weather-bg/cloudy/cloudy morning.png'),
    afternoon: require('../assets/backgrounds/weather-bg/cloudy/cloudy afternoon.png'),
    evening: require('../assets/backgrounds/weather-bg/cloudy/cloudy evening.png'),
    night: require('../assets/backgrounds/weather-bg/cloudy/cloudy night.png')
  };
  
  const rainyBackgrounds = {
    dawn: require('../assets/backgrounds/weather-bg/rainy/rainy dawn.png'),
    morning: require('../assets/backgrounds/weather-bg/rainy/rainy morning.png'),
    afternoon: require('../assets/backgrounds/weather-bg/rainy/rainy afternoon.png'),
    evening: require('../assets/backgrounds/weather-bg/rainy/rainy evening.png'),
    night: require('../assets/backgrounds/weather-bg/rainy/rainy night.png')
  };
  
  const snowyBackgrounds = {
    dawn: require('../assets/backgrounds/weather-bg/snowy/snowy dawn.jpg'),
    morning: require('../assets/backgrounds/weather-bg/snowy/snowy morning.jpg'),
    afternoon: require('../assets/backgrounds/weather-bg/snowy/snowy afternoon.jpg'),
    evening: require('../assets/backgrounds/weather-bg/snowy/snowy evening.jpg'),
    night: require('../assets/backgrounds/weather-bg/snowy/snowy night.jpg')
  };
  
  const stormyBackgrounds = {
    dawn: require('../assets/backgrounds/weather-bg/stormy/stormy dawn.jpg'),
    morning: require('../assets/backgrounds/weather-bg/stormy/stormy morning.jpg'),
    afternoon: require('../assets/backgrounds/weather-bg/stormy/stormy afternoon.jpg'),
    evening: require('../assets/backgrounds/weather-bg/stormy/stormy evening.jpg'),
    night: require('../assets/backgrounds/weather-bg/stormy/stormy night.jpg')
  };
  
  // Select the appropriate background set based on weather
  let backgroundMap;
  switch (weatherCondition) {
    case 'cloudy':
      backgroundMap = cloudyBackgrounds;
      break;
    case 'rainy':
      backgroundMap = rainyBackgrounds;
      break;
    case 'snowy':
      backgroundMap = snowyBackgrounds;
      break;
    case 'stormy':
      backgroundMap = stormyBackgrounds;
      break;
    default:
      backgroundMap = defaultBackgrounds;
      break;
  }
  
  return backgroundMap[timeOfDay] || backgroundMap.night;
};
