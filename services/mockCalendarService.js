// Mock Calendar Service
// Provides the same functionality as Google Calendar but stores data locally

import AsyncStorage from '@react-native-async-storage/async-storage';

const CALENDAR_STORAGE_KEY_PREFIX = 'weather_ai_calendar_events_';
const REMINDERS_STORAGE_KEY_PREFIX = 'weather_ai_calendar_reminders_';

// Helper function to get user-specific storage key
const getUserStorageKey = (userId, prefix) => {
  return `${prefix}${userId || 'anonymous'}`;
};

// Mock calendar service that mimics Google Calendar API
class MockCalendarService {
  static async isAuthenticated() {
    // Mock calendar is always "authenticated" since it's local
    return true;
  }

  static async authenticate() {
    // Mock authentication - always succeeds
    console.log('Mock calendar authentication successful');
    return { success: true, message: 'Mock calendar ready' };
  }

  static async signOut() {
    // Mock sign out - just clear local data if needed
    console.log('Mock calendar sign out');
    return { success: true };
  }

  static async getAccessToken() {
    // Mock access token
    return 'mock_access_token';
  }

  static async getEvents(startDate, endDate, userId = null) {
    try {
      console.log('MockCalendarService: getEvents called with userId:', userId, 'dateRange:', startDate, 'to', endDate);
      const events = await this._getStoredEvents(userId);
      console.log('MockCalendarService: Retrieved', events.length, 'total events for user');
      
      if (!startDate && !endDate) {
        return events;
      }

      // Filter events by date range
      const filteredEvents = events.filter(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        
        if (startDate && eventStart < startDate) return false;
        if (endDate && eventEnd > endDate) return false;
        
        return true;
      });

      console.log('MockCalendarService: Filtered to', filteredEvents.length, 'events in date range');
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching mock events:', error);
      return [];
    }
  }

  static async createEvent(eventData, userId = null) {
    try {
      const events = await this._getStoredEvents(userId);
      
      const newEvent = {
        id: `mock_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        status: 'confirmed',
        creator: {
          email: 'mock@weatheraiapp.com',
          displayName: 'Weather AI App',
        },
        organizer: {
          email: 'mock@weatheraiapp.com',
          displayName: 'Weather AI App',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 24 * 60 },
          ],
        },
        colorId: this._getRandomColorId(),
      };

      events.push(newEvent);
      await this._saveEvents(events, userId);

      console.log('Mock event created:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('Error creating mock event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  static async updateEvent(eventId, eventData, userId = null) {
    try {
      const events = await this._getStoredEvents(userId);
      const eventIndex = events.findIndex(event => event.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }

      const updatedEvent = {
        ...events[eventIndex],
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
        updated: new Date().toISOString(),
      };

      events[eventIndex] = updatedEvent;
      await this._saveEvents(events, userId);

      console.log('Mock event updated:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating mock event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  static async deleteEvent(eventId, userId = null) {
    try {
      const events = await this._getStoredEvents(userId);
      const filteredEvents = events.filter(event => event.id !== eventId);
      
      if (events.length === filteredEvents.length) {
        throw new Error('Event not found');
      }

      await this._saveEvents(filteredEvents, userId);
      console.log('Mock event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('Error deleting mock event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  // Helper method to parse AI requests and delete calendar events
  static async deleteEventsFromAI(aiRequest, weatherData, city, userId = null) {
    try {
      const lowerCaseRequest = aiRequest.toLowerCase();
      const events = await this._getStoredEvents(userId);
      let deletedEvents = [];
      let remainingEvents = [...events];

      // Parse what to delete
      if (lowerCaseRequest.includes('all') || lowerCaseRequest.includes('everything')) {
        // Delete all events
        deletedEvents = [...events];
        remainingEvents = [];
      } else if (lowerCaseRequest.includes('today')) {
        // Delete today's events
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        deletedEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          return eventDate >= startOfDay && eventDate < endOfDay;
        });
        remainingEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          return !(eventDate >= startOfDay && eventDate < endOfDay);
        });
      } else if (lowerCaseRequest.includes('tomorrow')) {
        // Delete tomorrow's events
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        const endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);
        
        deletedEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          return eventDate >= startOfDay && eventDate < endOfDay;
        });
        remainingEvents = events.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          return !(eventDate >= startOfDay && eventDate < endOfDay);
        });
      } else {
        // Try to match by event title/description
        const searchTerms = lowerCaseRequest.split(' ').filter(term => 
          term.length > 2 && !['delete', 'remove', 'cancel', 'clear', 'the', 'my', 'events'].includes(term)
        );
        
        deletedEvents = events.filter(event => {
          const eventText = `${event.summary} ${event.description || ''}`.toLowerCase();
          return searchTerms.some(term => eventText.includes(term));
        });
        remainingEvents = events.filter(event => {
          const eventText = `${event.summary} ${event.description || ''}`.toLowerCase();
          return !searchTerms.some(term => eventText.includes(term));
        });
      }

      if (deletedEvents.length === 0) {
        return { 
          success: false, 
          message: "No events found matching your request.",
          deletedCount: 0
        };
      }

      // Save the remaining events
      await this._saveEvents(remainingEvents, userId);

      const message = deletedEvents.length === 1 
        ? `Deleted "${deletedEvents[0].summary}"`
        : `Deleted ${deletedEvents.length} events`;

      return { 
        success: true, 
        message,
        deletedCount: deletedEvents.length,
        deletedEvents
      };
    } catch (error) {
      console.error('Error in deleteEventsFromAI:', error);
      return { 
        success: false, 
        message: `Sorry, I couldn't delete those events: ${error.message}`,
        deletedCount: 0
      };
    }
  }

  // Helper method to parse AI requests and create calendar events
  static async scheduleActivityFromAI(aiRequest, weatherData, city, userId = null) {
    try {
      const lowerCaseRequest = aiRequest.toLowerCase();
      let summary = 'Scheduled Activity';
      let startDateTime = new Date();
      let endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour default
      let location = city;
      let description = `Suggested by AI for ${city}. Weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;

      // Parse activity type
      if (lowerCaseRequest.includes('run') || lowerCaseRequest.includes('jog')) {
        summary = 'Morning Run';
        description = `Morning run in ${city}. Perfect weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;
      } else if (lowerCaseRequest.includes('gym') || lowerCaseRequest.includes('workout')) {
        summary = 'Gym Session';
        description = `Gym workout in ${city}. Weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;
      } else if (lowerCaseRequest.includes('picnic') || lowerCaseRequest.includes('outdoor')) {
        summary = 'Outdoor Picnic';
        description = `Outdoor picnic in ${city}. Great weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;
      } else if (lowerCaseRequest.includes('walk') || lowerCaseRequest.includes('stroll')) {
        summary = 'Evening Walk';
        description = `Evening walk in ${city}. Weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;
      } else if (lowerCaseRequest.includes('bike') || lowerCaseRequest.includes('cycling')) {
        summary = 'Bike Ride';
        description = `Bike ride in ${city}. Weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;
      } else if (lowerCaseRequest.includes('coffee') || lowerCaseRequest.includes('cafe')) {
        summary = 'Coffee Meeting';
        description = `Coffee meeting in ${city}. Weather: ${weatherData.temperature}°C, ${weatherData.condition}.`;
      }

      // Parse time
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

      // Parse specific times
      const timeMatch = lowerCaseRequest.match(/at (\d{1,2})(am|pm)?/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const ampm = timeMatch[2];

        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;

        startDateTime.setHours(hour, 0, 0);
        endDateTime.setHours(hour + 1, 0, 0);
      }

      // Parse duration
      const durationMatch = lowerCaseRequest.match(/(\d+)\s*(hour|hr|minute|min)/);
      if (durationMatch) {
        const duration = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2];
        
        if (unit.includes('hour') || unit.includes('hr')) {
          endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
        } else if (unit.includes('minute') || unit.includes('min')) {
          endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
        }
      }

      const eventData = {
        summary,
        description,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        location,
      };

      const createdEvent = await this.createEvent(eventData, userId);
      return { 
        success: true, 
        event: createdEvent, 
        message: `✅ "${summary}" has been added to your calendar for ${startDateTime.toLocaleDateString()} at ${startDateTime.toLocaleTimeString()}.` 
      };
    } catch (error) {
      console.error('Error in scheduleActivityFromAI:', error);
      return { success: false, message: `❌ Sorry, I couldn't schedule that activity: ${error.message}` };
    }
  }

  // Get current user info (mock)
  static async getCurrentUser() {
    return {
      id: 'mock_user_123',
      email: 'user@weatheraiapp.com',
      name: 'Weather AI User',
      photo: null,
    };
  }

  // Private helper methods
  static async _getStoredEvents(userId = null) {
    try {
      const storageKey = getUserStorageKey(userId, CALENDAR_STORAGE_KEY_PREFIX);
      const stored = await AsyncStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored events:', error);
      return [];
    }
  }

  static async _saveEvents(events, userId = null) {
    try {
      const storageKey = getUserStorageKey(userId, CALENDAR_STORAGE_KEY_PREFIX);
      await AsyncStorage.setItem(storageKey, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events:', error);
      throw error;
    }
  }

  static _getRandomColorId() {
    const colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Additional mock methods for enhanced functionality
  static async getUpcomingEvents(days = 7, userId = null) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);
    
    return this.getEvents(startDate, endDate, userId);
  }

  static async getTodayEvents(userId = null) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.getEvents(startOfDay, endOfDay, userId);
  }

  static async searchEvents(query, userId = null) {
    const events = await this._getStoredEvents(userId);
    const lowerQuery = query.toLowerCase();
    
    return events.filter(event => 
      event.summary.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      (event.location && event.location.toLowerCase().includes(lowerQuery))
    );
  }

  static async getEventsByDate(date, userId = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.getEvents(startOfDay, endOfDay, userId);
  }
}

export { MockCalendarService };
