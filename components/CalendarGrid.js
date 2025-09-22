import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Text, Title, Button, TextInput, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MockCalendarService } from '../services/mockCalendarService';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const CELL_WIDTH = Math.floor((width - 60) / 7); // 7 days in a week, accounting for contentCard padding, margins, and borders

const CalendarGrid = ({ onEventPress, userId = null, refreshKey = 0, lastUpdate = 0 }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerField, setPickerField] = useState('start');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  // Reload events when userId becomes available
  useEffect(() => {
    if (userId) {
      console.log('CalendarGrid: userId became available, reloading events');
      loadEvents();
    }
  }, [userId]);

  // Reload events when refreshKey changes (triggered by AI event creation)
  useEffect(() => {
    console.log('CalendarGrid: refreshKey changed to:', refreshKey);
    if (refreshKey > 0) {
      console.log('CalendarGrid: Reloading events due to refresh key change');
      loadEvents();
    }
  }, [refreshKey]);

  // Reload events when lastUpdate changes (triggered by AI event creation)
  useEffect(() => {
    console.log('CalendarGrid: lastUpdate changed to:', lastUpdate);
    if (lastUpdate > 0) {
      console.log('CalendarGrid: Reloading events due to lastUpdate change');
      loadEvents();
    }
  }, [lastUpdate]);

  const loadEvents = async () => {
    try {
      console.log('CalendarGrid: loadEvents called with userId:', userId);
      
      // Don't load events if we don't have a userId yet
      if (!userId) {
        console.log('CalendarGrid: No userId available, skipping event load');
        setEvents([]);
        return;
      }
      
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      console.log('CalendarGrid: Fetching events for date range:', startOfMonth, 'to', endOfMonth);
      const monthEvents = await MockCalendarService.getEvents(startOfMonth, endOfMonth, userId);
      console.log('CalendarGrid: Loaded events:', monthEvents.length, 'events');
      setEvents(monthEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Calculate how many rows we need based on where the last day falls
    const totalCells = days.length;
    const rowsNeeded = Math.ceil(totalCells / 7);
    const cellsNeeded = rowsNeeded * 7;
    const remainingCells = cellsNeeded - totalCells;
    
    // Add empty cells at the end to complete the last row
    for (let i = 0; i < remainingCells; i++) {
      days.push(null);
    }
    
    return { days, rowsNeeded };
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDayNames = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const handleAddEvent = () => {
    // Reset form to selected date or current date
    const baseDate = selectedDate || new Date();
    setEventForm({
      title: '',
      description: '',
      location: '',
      startDate: baseDate,
      endDate: new Date(baseDate.getTime() + 60 * 60 * 1000),
      startTime: baseDate,
      endTime: new Date(baseDate.getTime() + 60 * 60 * 1000),
    });
    setShowAddEventModal(true);
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      setIsCreatingEvent(true);

      // Combine date and time for start and end
      const startDateTime = new Date(eventForm.startDate);
      startDateTime.setHours(eventForm.startTime.getHours(), eventForm.startTime.getMinutes(), 0, 0);

      const endDateTime = new Date(eventForm.endDate);
      endDateTime.setHours(eventForm.endTime.getHours(), eventForm.endTime.getMinutes(), 0, 0);

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        Alert.alert('Error', 'End time must be after start time');
        setIsCreatingEvent(false);
        return;
      }

      // Validate that the event is not in the past (allow same day)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const eventDay = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate());
      
      if (eventDay < today) {
        Alert.alert('Error', 'Cannot create events in the past');
        setIsCreatingEvent(false);
        return;
      }

      const eventData = {
        summary: eventForm.title.trim(),
        description: eventForm.description.trim(),
        location: eventForm.location.trim(),
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
      };

      await MockCalendarService.createEvent(eventData, userId);
      
      // Refresh events
      await loadEvents();
      
      // Close modal and reset form
      setShowAddEventModal(false);
      setEventForm({
        title: '',
        description: '',
        location: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
      });

      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', `Failed to create event: ${error.message || 'Please try again.'}`);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      if (pickerField === 'start') {
        setEventForm(prev => ({ ...prev, startDate: selectedDate }));
      } else {
        setEventForm(prev => ({ ...prev, endDate: selectedDate }));
      }
    }
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      if (pickerField === 'start') {
        setEventForm(prev => ({ ...prev, startTime: selectedTime }));
      } else {
        setEventForm(prev => ({ ...prev, endTime: selectedTime }));
      }
    }
    if (Platform.OS === 'ios') {
      setShowTimePicker(false);
    }
  };

  const openDatePicker = (field) => {
    setPickerField(field);
    setPickerMode('date');
    setShowDatePicker(true);
  };

  const openTimePicker = (field) => {
    setPickerField(field);
    setPickerMode('time');
    setShowTimePicker(true);
  };

  const formatDateTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const { days, rowsNeeded } = getDaysInMonth(currentDate);
  const dayNames = getDayNames();

  return (
    <View style={styles.container}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Title style={styles.monthTitle}>
          {formatMonthYear(currentDate)}
        </Title>
        
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((dayName, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: rowsNeeded }, (_, rowIndex) => (
          <View key={rowIndex} style={styles.calendarRow}>
            {days.slice(rowIndex * 7, (rowIndex + 1) * 7).map((date, cellIndex) => {
              const index = rowIndex * 7 + cellIndex;
              const dayEvents = getEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isSelectedDay = isSelected(date);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isCurrentDay && styles.todayCell,
                    isSelectedDay && styles.selectedCell,
                  ]}
                  onPress={() => date && setSelectedDate(date)}
                >
                  {date && (
                    <>
                      <Text style={[
                        styles.dayText,
                        isCurrentDay && styles.todayText,
                        isSelectedDay && styles.selectedText,
                      ]}>
                        {date.getDate()}
                      </Text>
                      
                      {/* Event indicators */}
                      <View style={styles.eventIndicators}>
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <View
                            key={eventIndex}
                            style={[
                              styles.eventIndicator,
                              { backgroundColor: event.colorId ? `hsl(${event.colorId * 45}, 70%, 50%)` : '#4CAF50' }
                            ]}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                        )}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Selected date events */}
      {selectedDate && (
        <View style={styles.selectedDateEvents}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
            {getEventsForDate(selectedDate).map((event, index) => (
              <TouchableOpacity
                key={index}
                style={styles.eventItem}
                onPress={() => onEventPress && onEventPress(event)}
              >
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventTime}>
                    {new Date(event.start.dateTime || event.start.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.summary || 'No Title'}
                  </Text>
                  {event.location && (
                    <Text style={styles.eventLocation} numberOfLines={1}>
                      📍 {event.location}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <Text style={styles.noEventsText}>No events for this day</Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddEvent}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal
        visible={showAddEventModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (!isCreatingEvent) {
            setShowAddEventModal(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addEventModalContent}>
            <View style={styles.modalHeader}>
              <Title style={styles.modalTitle}>Add New Event</Title>
              <TouchableOpacity
                onPress={() => {
                  if (!isCreatingEvent) {
                    setShowAddEventModal(false);
                  }
                }}
                style={[styles.closeButton, isCreatingEvent && styles.disabledButton]}
                disabled={isCreatingEvent}
              >
                <MaterialCommunityIcons name="close" size={24} color={isCreatingEvent ? "#ccc" : "#fff"} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.eventForm} 
              contentContainerStyle={styles.eventFormContent}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                label="Event Title *"
                value={eventForm.title}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                style={styles.input}
                mode="filled"
                theme={{ 
                  colors: { 
                    primary: '#4CAF50',
                    text: '#fff',
                    placeholder: '#ccc',
                    background: 'transparent',
                    onSurface: '#fff',
                    onSurfaceVariant: '#ccc',
                    surface: 'rgba(120,130,150,0.6)',
                    surfaceVariant: 'rgba(120,130,150,0.6)'
                  } 
                }}
                textColor="#fff"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                labelStyle={styles.inputLabel}
              />

              <TextInput
                label="Description"
                value={eventForm.description}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                style={styles.input}
                mode="filled"
                multiline
                numberOfLines={3}
                theme={{ 
                  colors: { 
                    primary: '#4CAF50',
                    text: '#fff',
                    placeholder: '#ccc',
                    background: 'transparent',
                    onSurface: '#fff',
                    onSurfaceVariant: '#ccc',
                    surface: 'rgba(120,130,150,0.6)',
                    surfaceVariant: 'rgba(120,130,150,0.6)'
                  } 
                }}
                textColor="#fff"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                labelStyle={styles.inputLabel}
              />

              <TextInput
                label="Location"
                value={eventForm.location}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, location: text }))}
                style={styles.input}
                mode="filled"
                theme={{ 
                  colors: { 
                    primary: '#4CAF50',
                    text: '#fff',
                    placeholder: '#ccc',
                    background: 'transparent',
                    onSurface: '#fff',
                    onSurfaceVariant: '#ccc',
                    surface: 'rgba(120,130,150,0.6)',
                    surfaceVariant: 'rgba(120,130,150,0.6)'
                  } 
                }}
                textColor="#fff"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                labelStyle={styles.inputLabel}
              />

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Start Date & Time</Text>
              
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => openDatePicker('start')}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#4CAF50" />
                <Text style={styles.dateTimeText}>
                  {eventForm.startDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => openTimePicker('start')}
              >
                <MaterialCommunityIcons name="clock" size={20} color="#4CAF50" />
                <Text style={styles.dateTimeText}>
                  {eventForm.startTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>End Date & Time</Text>
              
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => openDatePicker('end')}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#4CAF50" />
                <Text style={styles.dateTimeText}>
                  {eventForm.endDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => openTimePicker('end')}
              >
                <MaterialCommunityIcons name="clock" size={20} color="#4CAF50" />
                <Text style={styles.dateTimeText}>
                  {eventForm.endTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>

            </ScrollView>

            {/* Fixed Button Container */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setShowAddEventModal(false)}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonText}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateEvent}
                style={styles.createButton}
                labelStyle={styles.createButtonText}
                loading={isCreatingEvent}
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? 'Creating...' : 'Create Event'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={pickerField === 'start' ? eventForm.startDate : eventForm.endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={pickerField === 'start' ? eventForm.startTime : eventForm.endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(120,130,150,0.4)',
  },
  monthTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayNamesRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNameCell: {
    width: CELL_WIDTH,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayNameText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calendarGrid: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: CELL_WIDTH,
    height: 60,
    padding: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(120,130,150,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
  },
  selectedCell: {
    backgroundColor: 'rgba(120,130,150,0.7)',
  },
  dayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 2,
  },
  eventIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
    marginVertical: 1,
  },
  moreEventsText: {
    color: '#ccc',
    fontSize: 8,
    marginLeft: 2,
  },
  selectedDateEvents: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  selectedDateTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120,130,150,0.4)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
  },
  eventTimeContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTime: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  eventDetails: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventLocation: {
    color: '#ccc',
    fontSize: 12,
  },
  noEventsText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  addEventModalContent: {
    backgroundColor: 'rgba(120,130,150,0.4)',
    borderRadius: 20,
    padding: 0,
    margin: 20,
    maxWidth: '90%',
    maxHeight: '85%',
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,130,150,0.6)',
    backgroundColor: 'rgba(120,130,150,0.4)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(120,130,150,0.7)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  eventForm: {
    flex: 1,
    padding: 20,
  },
  eventFormContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(120,130,150,0.7)',
    borderRadius: 8,
    color: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
  },
  inputLabel: {
    color: '#fff',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: 'rgba(120,130,150,0.7)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginTop: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120,130,150,0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
  },
  dateTimeText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,130,150,0.6)',
    backgroundColor: 'rgba(120,130,150,0.4)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
  },
  createButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#4CAF50',
  },
  createButtonText: {
    color: '#fff',
  },
});

export default CalendarGrid;
