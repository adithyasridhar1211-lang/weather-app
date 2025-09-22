import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Text, Title, Button, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MockCalendarService } from '../services/mockCalendarService';
import { AuthService } from '../services/supabase';
import CalendarGrid from './CalendarGrid';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const CalendarScreen = ({ onBack, devModeOverrides = null, refreshKey = 0, lastUpdate = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Refresh calendar when refreshKey changes (triggered by AI event creation)
  useEffect(() => {
    console.log('CalendarScreen: refreshKey changed to:', refreshKey);
    if (refreshKey > 0) {
      console.log('CalendarScreen: Triggering calendar refresh');
      // Trigger a refresh by updating loading state
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
  }, [refreshKey]);

  // Refresh calendar when lastUpdate changes (triggered by AI event creation)
  useEffect(() => {
    console.log('CalendarScreen: lastUpdate changed to:', lastUpdate);
    if (lastUpdate > 0) {
      console.log('CalendarScreen: Triggering calendar refresh due to lastUpdate change');
      // Trigger a refresh by updating loading state
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
  }, [lastUpdate]);


  const checkAuthStatus = async () => {
    try {
      const isAuth = await MockCalendarService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        // Get the current user ID
        const userResult = await AuthService.getCurrentUser();
        console.log('CalendarScreen: AuthService.getCurrentUser() result:', userResult);
        if (userResult.success && userResult.user) {
          console.log('CalendarScreen: Setting userId to:', userResult.user.id);
          setUserId(userResult.user.id);
        } else {
          console.log('CalendarScreen: Failed to get user ID:', userResult);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleMockSignIn = async () => {
    try {
      setLoading(true);
      await MockCalendarService.authenticate();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Could not initialize calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await MockCalendarService.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Could not sign out');
    }
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${selectedEvent.summary}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MockCalendarService.deleteEvent(selectedEvent.id, userId);
              setShowEventModal(false);
              setSelectedEvent(null);
              // Refresh the calendar by triggering a re-render
              setLoading(true);
              setTimeout(() => setLoading(false), 100);
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (loading) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ImageBackground
          source={getBackgroundImage(null, devModeOverrides)}
          style={styles.backgroundImage}
          resizeMode="cover"
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={getBackgroundImage(null, devModeOverrides)}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Calendar</Title>
          <View style={styles.headerActions}>
            {isAuthenticated ? (
              <Button
                mode="outlined"
                onPress={handleSignOut}
                style={styles.signOutButton}
                labelStyle={styles.signOutButtonText}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleMockSignIn}
                style={styles.signInButton}
                labelStyle={styles.signInButtonText}
                icon="calendar-check"
              >
                Initialize
              </Button>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.contentCard}>
            <View style={styles.content}>
          {!isAuthenticated ? (
            <View style={styles.authPrompt}>
              <MaterialCommunityIcons name="calendar-account" size={64} color="#fff" />
              <Title style={styles.authTitle}>Initialize Calendar</Title>
              <Text style={styles.authDescription}>
                Set up your local calendar to view and manage events. The AI assistant can help schedule activities and set reminders.
              </Text>
              <Button
                mode="contained"
                onPress={handleMockSignIn}
                style={styles.authButton}
                contentStyle={styles.authButtonContent}
                labelStyle={styles.authButtonText}
                icon="calendar-check"
              >
                Initialize Calendar
              </Button>
            </View>
          ) : (
            (() => {
              console.log('CalendarScreen: Rendering CalendarGrid with userId:', userId);
              return (
                <CalendarGrid 
                  onEventPress={handleEventPress} 
                  userId={userId} 
                  refreshKey={refreshKey} 
                  lastUpdate={lastUpdate} 
                />
              );
            })()
          )}
            </View>
          </View>
        </View>

        {/* Event Details Modal */}
        <Modal
          visible={showEventModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEventModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>Event Details</Title>
                <TouchableOpacity
                  onPress={() => setShowEventModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {selectedEvent && (
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{selectedEvent.summary}</Text>
                  <Text style={styles.eventTime}>
                    {formatDate(selectedEvent.start.dateTime || selectedEvent.start.date)}
                  </Text>
                  {selectedEvent.description && (
                    <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
                  )}
                  {selectedEvent.location && (
                    <View style={styles.eventLocation}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#ccc" />
                      <Text style={styles.eventLocationText}>{selectedEvent.location}</Text>
                    </View>
                  )}
                  
                  <View style={styles.eventActions}>
                    <Button
                      mode="outlined"
                      onPress={handleDeleteEvent}
                      style={styles.deleteButton}
                      labelStyle={styles.deleteButtonText}
                      icon="delete"
                    >
                      Delete Event
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  signInButton: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  signOutButton: {
    borderColor: 'rgba(120,130,150,0.8)',
    borderRadius: 20,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'rgba(120,130,150,0.25)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
    padding: 20,
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  authPrompt: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  authTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  authDescription: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  authButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(120,130,150,0.4)',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(120,130,150,0.4)',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventTime: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
  },
  eventDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocationText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8,
  },
  eventActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: '#ff6b6b',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ff6b6b',
  },
});

export default CalendarScreen;
