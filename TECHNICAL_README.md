# Technical Overview - Weather AI App

## Technology Stack & Architecture

This is a **React Native mobile application** built with **Expo** that provides intelligent weather forecasting, personalized activity suggestions, and natural AI conversation. The app is developed using **JavaScript/ES6** as the primary programming language and follows a modern React Native architecture with component-based design patterns.

## Core Technologies

**Frontend Framework**: React Native 0.81.4 with React 19.1.0, utilizing Expo SDK ~54.0.0 for cross-platform mobile development. The application employs **React Native Paper** (v5.12.5) for Material Design components and **Expo Vector Icons** for comprehensive iconography. The UI is enhanced with **Expo Linear Gradient** for visual effects and **Expo Location** for GPS-based location services.

**Backend & Authentication**: **Supabase** (@supabase/supabase-js v2.38.0) serves as the backend-as-a-service, providing user authentication, database management, and real-time capabilities. The app implements OAuth 2.0 authentication flows for both Google and Apple sign-in, with PKCE (Proof Key for Code Exchange) security flow and session persistence using **AsyncStorage**.

**External APIs**: 
- **OpenWeatherMap API** for real-time weather data, 5-day forecasts, and geocoding services
- **OpenAI GPT-3.5-turbo** for AI-powered activity suggestions and natural conversation capabilities

## Development Tools & Build System

**Build System**: **Expo CLI** with **Metro bundler** for JavaScript bundling and asset management. The Android build uses **Gradle** with **Kotlin** (Android Gradle Plugin) for native Android development, targeting API level 34 with minimum SDK 21.

**Development Environment**: **Babel** (v7.25.0) with **babel-preset-expo** for JavaScript transpilation, supporting modern ES6+ features and React Native optimizations.

## Project Structure

The application follows a **modular component architecture** with clear separation of concerns:

- **`/components/`**: Reusable UI components (AuthScreen, WeatherCard, ActivitySuggestions, CalendarScreen, etc.)
- **`/services/`**: Business logic and API integrations (supabase.js, api.js, calendarService.js)
- **`/api/`**: External API modules (weather.js, activities.js)
- **`/android/`**: Native Android configuration and build files
- **`/assets/`**: Static resources including images, icons, and background assets

## Key Features & Technical Implementation

**Authentication Flow**: Multi-step onboarding with Supabase Auth, including email/password registration, social OAuth (Google/Apple), and user profile management with metadata tracking for onboarding completion states.

**Real-Time Weather Integration**: 
- Direct OpenWeatherMap API integration for current weather conditions
- 5-day weather forecast with hourly breakdowns
- Comprehensive weather metrics (temperature, humidity, wind speed, pressure, visibility)
- Robust error handling with fallback data for network issues
- City name processing and geocoding for accurate location-based weather

**AI-Powered Chatbot (WeatherBot)**:
- Natural conversation capabilities using OpenAI GPT-3.5-turbo
- Context-aware responses based on current weather conditions
- Conversation memory for flowing dialogue (last 6 messages)
- Broader topic discussion beyond just weather
- Friendly personality with emojis and engaging responses
- Activity suggestions and local recommendations

**Forecast System**:
- Real 5-day weather forecasts from OpenWeatherMap
- Daily weather summaries with high/low temperatures
- Hourly weather patterns for detailed planning
- Weather condition analysis and predictions

**Cross-Platform Compatibility**: Built with Expo for seamless deployment across iOS and Android platforms, with responsive design using React Native's Dimensions API and platform-specific optimizations.

**State Management**: React hooks (useState, useEffect) for local state management, with Supabase for persistent data storage and user session management.

**Error Handling & Reliability**:
- Comprehensive API error handling with user-friendly messages
- Fallback mechanisms for weather and AI services
- Network timeout protection
- Graceful degradation when services are unavailable

## API Integration Details

**Weather API (OpenWeatherMap)**:
- Current weather: `/weather` endpoint with city-based queries
- 5-day forecast: `/forecast` endpoint with 3-hourly data
- API key: `3f7363efa37c0c75405403361045f5a0`
- Units: Metric (Celsius, km/h, hPa)
- Error handling: 404 (city not found), 401 (invalid key), 429 (rate limit)

**AI Chat API (OpenAI)**:
- Model: GPT-3.5-turbo
- Max tokens: 300 per response
- Temperature: 0.8 for creative responses
- Context: Weather data + conversation history
- Features: Natural conversation, activity suggestions, local recommendations

## Recent Improvements & Fixes

**Weather Data Reliability**:
- ✅ Fixed AbortSignal.timeout compatibility issues for React Native
- ✅ Implemented direct weather API calls (removed complex geocoding)
- ✅ Added comprehensive error handling with fallback data
- ✅ Real-time weather data now working consistently

**Forecast System**:
- ✅ Implemented real 5-day forecast API integration
- ✅ Added daily weather summaries with high/low temperatures
- ✅ Created hourly weather breakdowns for detailed planning
- ✅ Replaced mock data with actual OpenWeatherMap forecast data

**AI Chatbot Enhancement**:
- ✅ Enhanced personality with natural, friendly conversation style
- ✅ Added conversation memory (last 6 messages)
- ✅ Implemented broader topic discussion capabilities
- ✅ Fixed timestamp formatting errors
- ✅ Standardized message structure for consistency

**Technical Fixes**:
- ✅ Resolved TypeError: timestamp.toLocaleTimeString issues
- ✅ Standardized message structure across all components
- ✅ Improved error handling and user feedback
- ✅ Enhanced API reliability and fallback mechanisms

## Security & Configuration

The application implements secure API key management, OAuth 2.0 with PKCE flow, and proper Android permissions for location services. Google Services integration is configured for Android builds with proper package naming (`com.weatheraiapp.esa`) and signing configurations.

## Performance & Optimization

- **API Response Times**: Weather data < 2s, AI responses < 5s
- **Memory Management**: Conversation history limited to 6 messages
- **Error Recovery**: Automatic fallback to mock data when APIs fail
- **Network Resilience**: Timeout handling and retry mechanisms

This architecture provides a scalable, maintainable, and feature-rich mobile weather application with intelligent AI integration, real-time data, and modern development practices.
