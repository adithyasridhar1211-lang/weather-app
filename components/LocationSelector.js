import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Title, Button, TextInput, Chip, List, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const LocationSelector = ({ onLocationSelect, currentLocation, selectedCity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // OpenWeather API key - in production, this should be in environment variables
  const OPENWEATHER_API_KEY = '3f7363efa37c0c75405403361045f5a0';

  const popularCities = [
    'New York, NY',
    'London, UK',
    'Tokyo, Japan',
    'Paris, France',
    'Sydney, Australia',
    'Los Angeles, CA',
    'Berlin, Germany',
    'Toronto, Canada',
  ];

  const searchCities = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Try different search formats
      const searchQueries = [
        query.trim(), // Original query
        query.split(',')[0].trim(), // Just city name
        query.replace(/,.*$/, '').trim() // Remove state/country
      ];
      
      let allResults = [];
      
      for (const searchQuery of searchQueries) {
        if (searchQuery.trim() === '') continue;
        
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${OPENWEATHER_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          allResults = [...allResults, ...data];
        }
      }
      
      // Remove duplicates based on lat/lon
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.lat === result.lat && r.lon === result.lon)
      );
      
      setSearchResults(uniqueResults.slice(0, 5)); // Limit to 5 results
      setShowResults(true);
    } catch (error) {
      console.error('Error searching cities:', error);
      Alert.alert('Search Error', 'Could not search for cities');
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCitySelect = (city) => {
    onLocationSelect(city);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchCities(searchQuery.trim());
    }
  };

  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 2) {
      searchCities(text.trim());
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleCurrentLocation = async () => {
    if (currentLocation) {
      try {
        // Get city name from coordinates
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const city = reverseGeocode[0];
          const cityName = `${city.city}, ${city.region}`;
          onLocationSelect(cityName);
        } else {
          onLocationSelect('Current Location');
        }
      } catch (error) {
        console.error('Error getting city name:', error);
        onLocationSelect('Current Location');
      }
    } else {
      Alert.alert('Location Unavailable', 'Could not get your current location');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-marker" size={24} color="#fff" />
        <Text style={styles.title}>Select Location</Text>
      </View>

      {selectedCity && (
        <View style={styles.selectedLocation}>
          <Chip
            icon="check"
            style={styles.selectedChip}
            textStyle={styles.selectedChipText}
          >
            {selectedCity}
          </Chip>
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          label="Search for a city"
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          style={styles.searchInput}
          mode="outlined"
          placeholderTextColor="#999"
          theme={{
            colors: {
              primary: '#fff',
              surface: 'rgba(120,130,150,0.4)',
              onSurface: '#fff',
            },
          }}
          right={
            <TextInput.Icon
              icon="magnify"
              onPress={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              iconColor="#fff"
            />
          }
        />
        <Button
          mode="outlined"
          onPress={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          style={styles.searchButton}
          labelStyle={styles.searchButtonText}
          loading={isSearching}
        >
          Search
        </Button>
      </View>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((city, index) => (
            <View
              key={index}
              style={styles.searchResultItem}
              onTouchEnd={() => {
                // Create a proper city name format
                let cityName = city.name;
                if (city.state && city.country) {
                  cityName = `${city.name}, ${city.state}, ${city.country}`;
                } else if (city.country) {
                  cityName = `${city.name}, ${city.country}`;
                }
                handleCitySelect(cityName);
              }}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
              <View style={styles.searchResultText}>
                <Text style={styles.searchResultTitle}>
                  {city.name}{city.state ? `, ${city.state}` : ''}, {city.country}
                </Text>
                <Text style={styles.searchResultDescription}>
                  {city.country} ({city.lat.toFixed(2)}, {city.lon.toFixed(2)})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {showResults && searchResults.length === 0 && searchQuery.trim().length > 2 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No cities found for "{searchQuery}"</Text>
        </View>
      )}

      <View style={styles.locationButtons}>
        <Button
          mode="contained"
          onPress={handleCurrentLocation}
          icon="crosshairs-gps"
          style={styles.locationButton}
          contentStyle={styles.locationButtonContent}
          labelStyle={styles.locationButtonText}
          disabled={!currentLocation}
        >
          Use Current Location
        </Button>
      </View>

      <View style={styles.popularCities}>
        <Text style={styles.sectionTitle}>Popular Cities</Text>
        <View style={styles.chipContainer}>
          {popularCities.map((city, index) => (
            <Chip
              key={index}
              style={styles.cityChip}
              textStyle={styles.cityChipText}
              onPress={() => handleCitySelect(city)}
            >
              {city}
            </Chip>
          ))}
        </View>
      </View>
    </View>
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
    marginBottom: 20,
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedLocation: {
    marginBottom: 20,
  },
  selectedChip: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  selectedChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 20,
  },
  searchButton: {
    minWidth: 80,
    borderColor: '#fff',
  },
  searchButtonText: {
    color: '#fff',
  },
  locationButtons: {
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  locationButtonContent: {
    paddingVertical: 12,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  popularCities: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityChip: {
    margin: 4,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderColor: 'rgba(120,130,150,0.8)',
    borderWidth: 1,
  },
  cityChipText: {
    color: '#fff',
    fontSize: 12,
  },
  searchResults: {
    marginTop: 12,
    maxHeight: 200,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 12,
    padding: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(120,130,150,0.5)',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultDescription: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  noResults: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 12,
  },
  noResultsText: {
    color: '#ccc',
    fontStyle: 'italic',
  },
});

export default LocationSelector;
