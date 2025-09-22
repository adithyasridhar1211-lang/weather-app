import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CalendarCard = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar" size={24} color="#fff" />
        <Title style={styles.title}>Calendar</Title>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
      </View>
      
      <Paragraph style={styles.description}>
        View and manage your schedule
      </Paragraph>
      
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="calendar-plus" size={16} color="#ccc" />
          <Paragraph style={styles.featureText}>Schedule activities</Paragraph>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="bell" size={16} color="#ccc" />
          <Paragraph style={styles.featureText}>Set reminders</Paragraph>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="sync" size={16} color="#ccc" />
          <Paragraph style={styles.featureText}>Sync with Google</Paragraph>
        </View>
      </View>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#ccc',
  },
});

export default CalendarCard;
