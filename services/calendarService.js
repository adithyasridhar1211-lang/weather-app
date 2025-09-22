// Google Calendar API Service
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '620686680793-8unr7oibo26fs67l0ni5e364o46qhgp6.apps.googleusercontent.com';
const CALENDAR_ID = 'primary';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

// Store tokens
let accessToken = null;
let refreshToken = null;

class CalendarService {
  static async isAuthenticated() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  static async authenticate() {
    try {
      console.log('Starting Google device authentication...');
      
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        console.log('User already signed in');
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        return { success: true };
      }

      // Sign in with device Google account
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google Sign-In successful:', userInfo);
      
      // Get access tokens
      const tokens = await GoogleSignin.getTokens();
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      
      console.log('Access token received:', accessToken ? 'Yes' : 'No');
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Error during Google authentication:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Play services not available');
      } else {
        throw new Error(`Google Sign-In failed: ${error.message}`);
      }
    }
  }

  static async signOut() {
    try {
      await GoogleSignin.signOut();
      accessToken = null;
      refreshToken = null;
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  static async getAccessToken() {
    try {
      if (!accessToken) {
        // Try to get fresh tokens
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (!isSignedIn) {
          throw new Error('No access token available. Please sign in first.');
        }
        
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
      }
      
      return accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token. Please sign in again.');
    }
  }

  static async getEvents(startDate, endDate) {
    try {
      const currentAccessToken = await this.getAccessToken();
      
      const startTime = startDate ? startDate.toISOString() : new Date().toISOString();
      const endTime = endDate ? endDate.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?` +
        `timeMin=${startTime}&timeMax=${endTime}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.refreshAccessToken();
          return this.getEvents(startDate, endDate);
        }
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  static async refreshAccessToken() {
    try {
      const tokens = await GoogleSignin.getTokens();
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      console.log('Access token refreshed');
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  static async createEvent(eventData) {
    try {
      const currentAccessToken = await this.getAccessToken();
      
      const event = {
        summary: eventData.summary,
        description: eventData.description || '',
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'UTC',
        },
        location: eventData.location || '',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.refreshAccessToken();
          return this.createEvent(eventData);
        }
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const createdEvent = await response.json();
      console.log('Event created:', createdEvent);
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  static async updateEvent(eventId, eventData) {
    try {
      const currentAccessToken = await this.getAccessToken();
      
      const event = {
        summary: eventData.summary,
        description: eventData.description || '',
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'UTC',
        },
        location: eventData.location || '',
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.refreshAccessToken();
          return this.updateEvent(eventId, eventData);
        }
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const updatedEvent = await response.json();
      console.log('Event updated:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  static async deleteEvent(eventId) {
    try {
      const currentAccessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.refreshAccessToken();
          return this.deleteEvent(eventId);
        }
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      console.log('Event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  // Helper method to parse AI requests and create calendar events
  static async scheduleActivityFromAI(aiRequest, weatherData, city) {
    try {
      // Simple parsing for demonstration. In a real app, you'd use a more robust NLP solution.
      const lowerCaseRequest = aiRequest.toLowerCase();
      let summary = 'Scheduled Activity';
      let startDateTime = new Date();
      let endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour default
      let location = city;
      let description = `Suggested by AI for ${city}. Weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;

      // Example parsing logic (can be expanded)
      if (lowerCaseRequest.includes('run')) summary = 'Morning Run';
      if (lowerCaseRequest.includes('gym')) summary = 'Gym Session';
      if (lowerCaseRequest.includes('picnic')) summary = 'Picnic';

      // Basic date/time parsing (needs more robust implementation)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (lowerCaseRequest.includes('tomorrow')) {
        startDateTime = tomorrow;
        endDateTime = new Date(tomorrow.getTime() + 60 * 60 * 1000);
      }

      if (lowerCaseRequest.includes('morning')) {
        startDateTime.setHours(9, 0, 0);
        endDateTime.setHours(10, 0, 0);
      } else if (lowerCaseRequest.includes('afternoon')) {
        startDateTime.setHours(14, 0, 0);
        endDateTime.setHours(15, 0, 0);
      } else if (lowerCaseRequest.includes('evening')) {
        startDateTime.setHours(19, 0, 0);
        endDateTime.setHours(20, 0, 0);
      }

      // More advanced parsing for specific times (e.g., "at 7am")
      const timeMatch = lowerCaseRequest.match(/at (\d{1,2})(am|pm)?/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const ampm = timeMatch[2];

        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0; // Midnight

        startDateTime.setHours(hour, 0, 0);
        endDateTime.setHours(hour + 1, 0, 0);
      }

      const eventData = {
        summary,
        description,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        location,
      };

      const createdEvent = await this.createEvent(eventData);
      return { success: true, event: createdEvent, message: 'Event added to your Google Calendar.' };
    } catch (error) {
      console.error('Error in scheduleActivityFromAI:', error);
      return { success: false, message: error.message };
    }
  }

  // Get current user info
  static async getCurrentUser() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (!isSignedIn) {
        throw new Error('User not signed in');
      }
      
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get current user');
    }
  }
}

export { CalendarService };