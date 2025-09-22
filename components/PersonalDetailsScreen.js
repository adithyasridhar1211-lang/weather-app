import React, { useState } from 'react';
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
import { Text, TextInput, Button, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthService } from '../services/supabase';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const PersonalDetailsScreen = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const genderOptions = [
    'Male',
    'Female',
    'Gay',
    'Lesbian',
    'Trans',
    'Other',
    'Prefer not to say',
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
    setShowGenderModal(false);
  };

  const handleContinue = async () => {
    // Validate form data
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    if (!formData.age.trim()) {
      Alert.alert('Error', 'Please enter your age');
      return;
    }
    
    if (!formData.gender.trim()) {
      Alert.alert('Error', 'Please enter your gender');
      return;
    }

    setLoading(true);
    try {
      // Save personal details to user metadata
      const result = await AuthService.updateProfile({
        personal_details: {
          username: formData.username.trim(),
          age: parseInt(formData.age),
          gender: formData.gender.trim(),
        },
        personal_details_completed: true,
        personal_details_completed_at: new Date().toISOString(),
      });

      if (result.success) {
        Alert.alert(
          'Details Saved!',
          'Your personal details have been saved successfully.',
          [{ text: 'Continue', onPress: onComplete }]
        );
      } else {
        throw new Error(result.error || 'Failed to save personal details');
      }
    } catch (error) {
      console.error('Error saving personal details:', error);
      Alert.alert(
        'Error', 
        `Failed to save personal details: ${error.message || 'Please try again.'}`
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={getBackgroundImage(null)}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleLine1}>Plan your day</Text>
            <Text style={styles.titleLine2}>with precision</Text>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal details</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <TextInput
              mode="outlined"
              placeholder="Username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              style={styles.inputField}
              placeholderTextColor="#fff"
              theme={{
                colors: {
                  primary: '#fff',
                  surface: 'rgba(120,130,150,0.6)',
                  onSurface: '#fff',
                },
              }}
            />
            
            <TextInput
              mode="outlined"
              placeholder="Age"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              style={styles.inputField}
              placeholderTextColor="#fff"
              keyboardType="numeric"
              theme={{
                colors: {
                  primary: '#fff',
                  surface: 'rgba(120,130,150,0.6)',
                  onSurface: '#fff',
                },
              }}
            />
            
            <TouchableOpacity
              style={styles.genderDropdown}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={styles.genderDropdownText}>
                {formData.gender || 'Select Gender'}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.continueButtonContent}
            labelStyle={styles.continueButtonText}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </ScrollView>

        {/* Gender Selection Modal */}
        <Modal
          visible={showGenderModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Gender</Text>
                <TouchableOpacity
                  onPress={() => setShowGenderModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.genderList}>
                {genderOptions.map((gender, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.genderOption}
                    onPress={() => handleGenderSelect(gender)}
                  >
                    <Text style={styles.genderOptionText}>{gender}</Text>
                    {formData.gender === gender && (
                      <MaterialCommunityIcons 
                        name="check" 
                        size={20} 
                        color="#fff" 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  titleLine1: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  titleLine2: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  titleLine3: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputField: {
    marginBottom: 20,
    backgroundColor: 'rgba(120,130,150,0.7)',
    borderRadius: 12,
  },
  genderDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(120,130,150,0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
  },
  genderDropdownText: {
    color: '#fff',
    fontSize: 16,
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
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.6)',
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
  genderList: {
    maxHeight: 300,
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,130,150,0.3)',
  },
  genderOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    marginTop: 20,
  },
  continueButtonContent: {
    paddingVertical: 12,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalDetailsScreen;
