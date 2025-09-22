import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ActivitySuggestions = ({ suggestions, weatherData, onChatPress }) => {
  if (!suggestions) return null;

  const getActivityIcon = (category) => {
    const iconMap = {
      'outdoor': 'nature',
      'indoor': 'home',
      'sports': 'soccer',
      'entertainment': 'movie',
      'food': 'food',
      'shopping': 'shopping',
      'cultural': 'bank',
      'relaxation': 'spa',
    };
    
    return iconMap[category.toLowerCase()] || 'star';
  };

  const getWeatherContext = () => {
    if (!weatherData) return '';
    
    const temp = weatherData.temperature;
    const condition = weatherData.condition.toLowerCase();
    const time = new Date().getHours();
    
    let context = `It's ${temp}°C and ${condition}`;
    
    if (time < 6) context += ' (early morning)';
    else if (time < 12) context += ' (morning)';
    else if (time < 17) context += ' (afternoon)';
    else if (time < 21) context += ' (evening)';
    else context += ' (night)';
    
    return context;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onChatPress(activity)} activeOpacity={0.8}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#fff" />
        <Title style={styles.title}>Activity Suggestions</Title>
        <MaterialCommunityIcons name="chat" size={20} color="#fff" />
      </View>
      
      <Paragraph style={styles.context}>
        {getWeatherContext()}
      </Paragraph>
      
      <View style={styles.divider} />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.suggestionsContainer}>
          {suggestions.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <MaterialCommunityIcons
                  name={getActivityIcon(activity.category)}
                  size={32}
                  color="#fff"
                />
                <Title style={styles.activityTitle}>{activity.title}</Title>
                <Paragraph style={styles.activityDescription}>
                  {activity.description}
                </Paragraph>
                <View style={styles.chipContainer}>
                  <Chip style={styles.chip} textStyle={styles.chipText}>
                    {activity.category}
                  </Chip>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {suggestions.recommendation && (
        <View style={styles.recommendationContainer}>
          <View style={styles.divider} />
          <View style={styles.recommendationHeader}>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
            <Title style={styles.recommendationTitle}>Top Recommendation</Title>
          </View>
          <Paragraph style={styles.recommendationText}>
            {suggestions.recommendation}
          </Paragraph>
        </View>
      )}
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
  },
  context: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(120,130,150,0.5)',
    marginVertical: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  activityCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  activityContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
    color: '#fff',
  },
  activityDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#ccc',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    margin: 2,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderColor: 'rgba(120,130,150,0.8)',
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    color: '#fff',
  },
  recommendationContainer: {
    marginTop: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  recommendationText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});

export default ActivitySuggestions;
