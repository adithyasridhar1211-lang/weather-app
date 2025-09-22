# Weather AI App

A React Native mobile application providing real-time weather data and AI-powered activity suggestions with natural conversation capabilities.

## Overview

This application integrates OpenWeatherMap API for weather data and OpenAI GPT-3.5-turbo for intelligent activity recommendations. Built with Expo for cross-platform deployment and Supabase for user authentication.

## Technical Stack

- **Frontend**: React Native 0.81.4 with Expo SDK 54
- **UI Framework**: React Native Paper 5.12.5
- **Backend**: Supabase (Authentication & Database)
- **APIs**: OpenWeatherMap, OpenAI GPT-3.5-turbo
- **State Management**: React Hooks
- **Build System**: Metro Bundler with Babel

## Core Features

### Weather Integration
- Real-time current weather data
- 5-day weather forecast with hourly breakdowns
- Location-based weather (GPS or city search)
- Comprehensive weather metrics (temperature, humidity, wind, pressure)

### AI Chatbot (WeatherBot)
- Natural conversation using OpenAI GPT-3.5-turbo
- Weather-aware activity suggestions
- Conversation memory (last 6 messages)
- Broader topic discussion capabilities
- Local recommendations and scheduling

### User Interface
- Material Design components
- Dynamic weather-based backgrounds
- Responsive design for iOS and Android
- Multi-step onboarding flow

## Installation

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Physical device with Expo Go app

### Setup
```bash
# Clone repository
git clone <repository-url>
cd weather-ai-app

# Install dependencies
npm install

# Start development server
npx expo start
```

### API Configuration
1. **OpenWeatherMap**: Get API key from [OpenWeatherMap](https://openweathermap.org/api)
2. **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Supabase**: Set up project and get credentials

Update API keys in `services/api.js`:
```javascript
const OPENWEATHER_API_KEY = 'your_openweather_key';
const OPENAI_API_KEY = 'your_openai_key';
```

## Project Structure

```
src/
├── components/           # React Native components
│   ├── WeatherCard.js   # Weather display
│   ├── ForecastScreen.js # 5-day forecast
│   ├── ActivityChatScreen.js # AI chatbot
│   └── ...
├── services/            # API integrations
│   ├── api.js          # Weather & AI APIs
│   └── supabase.js     # Authentication
├── utils/              # Utility functions
└── assets/             # Static resources
```

## API Integration

### Weather API
- **Endpoint**: OpenWeatherMap `/weather` and `/forecast`
- **Authentication**: API key
- **Data**: Current weather, 5-day forecast, hourly data
- **Error Handling**: Fallback data for network failures

### AI Chat API
- **Model**: GPT-3.5-turbo
- **Context**: Weather data + conversation history
- **Features**: Natural conversation, activity suggestions
- **Rate Limiting**: 300 tokens per response

## Development

### Local Development
```bash
# Start Expo development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Building
```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

## Configuration

### Environment Variables
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

### Android Configuration
- Package name: `com.weatheraiapp.esa`
- Target SDK: 34
- Minimum SDK: 21

## Error Handling

- **Network Errors**: Automatic fallback to mock data
- **API Failures**: User-friendly error messages
- **Location Services**: Graceful degradation without GPS
- **Authentication**: Secure token management

## Performance

- **Weather API**: < 2 second response time
- **AI Responses**: < 5 second response time
- **Memory Management**: Limited conversation history
- **Offline Support**: Cached weather data

## Troubleshooting

### Common Issues
1. **API Key Errors**: Verify keys are correctly configured
2. **Location Permission**: Ensure location services are enabled
3. **Network Timeouts**: Check internet connection
4. **Build Errors**: Clear Metro cache with `npx expo start --clear`

### Debug Mode
```bash
# Enable debug logging
npx expo start --dev-client
```

## License

MIT License - See LICENSE file for details

## Support

For technical issues:
- Check troubleshooting section
- Review Expo documentation
- Open GitHub issue with error details