import React, { useState, useRef, useEffect } from 'react';
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
  Keyboard,
} from 'react-native';
import { Text, TextInput, Button, Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MockCalendarService } from '../services/mockCalendarService';
import { AuthService } from '../services/supabase';
import { getBackgroundImage } from '../utils/backgroundUtils';

const { width, height } = Dimensions.get('window');

const ActivityChatScreen = ({ weatherData, city, selectedActivity, onBack, devModeOverrides = null, onCalendarRefresh = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);

  const OPENAI_API_KEY = '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';

  useEffect(() => {
    // Get user ID when component loads
    const getUserId = async () => {
      try {
        const userResult = await AuthService.getCurrentUser();
        if (userResult.success && userResult.user) {
          setUserId(userResult.user.id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    
    getUserId();

    // Add a welcome message when chat starts
    if (messages.length === 0) {
      let welcomeText = `Hey there! 👋 I'm WeatherBot, your friendly AI companion. I see you're in ${city} where it's currently ${weatherData?.temperature || 'unknown'}°C with ${weatherData?.condition || 'some weather'} conditions.`;
      
      if (selectedActivity) {
        welcomeText += `\n\nI noticed you're interested in "${selectedActivity.title}" - that sounds like a great choice! I can help you plan this activity, suggest similar ones, or answer any questions you have about it.`;
      }
      
      welcomeText += `\n\nI'm here to chat about activities, weather, or really anything you'd like to talk about! What's on your mind today? 😊`;
      
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        text: welcomeText,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedActivity]);


  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Rate limiting protection - prevent messages too close together
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime;
    const minInterval = 2000; // 2 seconds minimum between messages

    if (timeSinceLastMessage < minInterval) {
      const waitTime = Math.ceil((minInterval - timeSinceLastMessage) / 1000);
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        text: `Please wait ${waitTime} more seconds before sending another message.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setLastMessageTime(now);

    try {
      // Build conversation context with recent messages
      const conversationMessages = [
        {
          role: 'system',
          content: `You are a friendly, helpful AI assistant named WeatherBot. You're chatting with someone in ${city} where the current weather is ${weatherData.temperature}°C, ${weatherData.condition} (${weatherData.description}). Humidity: ${weatherData.humidity}%, Wind: ${Math.round(weatherData.windSpeed * 3.6)} km/h.

Your personality:
- Be warm, conversational, and genuinely helpful
- Use a natural, friendly tone - like talking to a friend
- You can discuss weather-related activities, but also feel free to chat about other topics
- Be curious about the user's interests, plans, and experiences
- Use emojis occasionally to make conversations more engaging
- Ask follow-up questions to keep the conversation flowing
- Share interesting facts or tips when relevant
- Be supportive and encouraging

You can help with:
- Weather-appropriate activity suggestions
- General conversation about life, interests, hobbies
- Local recommendations for ${city}
- Scheduling activities and events
- Answering questions about various topics
- Providing motivation and encouragement

Remember: You're not just a weather bot - you're a friendly companion who happens to know a lot about weather and activities. Feel free to be conversational and go off-topic when it feels natural!`
        }
      ];

      // Add recent conversation history (last 6 messages to keep context manageable)
      const recentMessages = messages.slice(-6);
      recentMessages.forEach(msg => {
        conversationMessages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add current user message
      conversationMessages.push({
        role: 'user',
        content: inputText.trim()
      });

      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: conversationMessages,
        max_tokens: 300,
        temperature: 0.8, // Slightly higher for more creative responses
      };

      console.log('Sending request to OpenAI:', JSON.stringify(requestBody, null, 2));
      console.log('API Key (first 10 chars):', OPENAI_API_KEY.substring(0, 10) + '...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI response:', JSON.stringify(data, null, 2));
      
      let botResponse = data.choices[0].message.content;
      
      // Check if the user wants to schedule something
      const scheduleKeywords = ['schedule', 'book', 'plan', 'arrange', 'set up', 'add to calendar'];
      const wantsToSchedule = scheduleKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );
      
      if (wantsToSchedule) {
        try {
          // Try to schedule the activity
              const scheduleResult = await MockCalendarService.scheduleActivityFromAI(
            inputText.trim(),
            weatherData,
            city,
            userId
          );
          
          if (scheduleResult.success) {
            botResponse += `\n\n✅ I've scheduled "${scheduleResult.event.summary}" for you! ${scheduleResult.message}`;
            // Trigger calendar refresh
            console.log('AI Event Created - Triggering calendar refresh');
            if (onCalendarRefresh) {
              console.log('Calling onCalendarRefresh callback');
              onCalendarRefresh();
            } else {
              console.log('onCalendarRefresh callback not available');
            }
          } else {
            botResponse += `\n\n❌ I couldn't schedule that activity: ${scheduleResult.message}`;
          }
        } catch (error) {
          console.error('Error scheduling activity:', error);
          botResponse += `\n\n❌ I had trouble scheduling that activity. Please try again.`;
        }
      }
      
      // Check if the user wants to delete something
      const deleteKeywords = ['delete', 'remove', 'cancel', 'clear'];
      const wantsToDelete = deleteKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );
      
      if (wantsToDelete) {
        try {
          // Try to find and delete events
          const deleteResult = await MockCalendarService.deleteEventsFromAI(
            inputText.trim(),
            weatherData,
            city,
            userId
          );
          
          if (deleteResult.success) {
            botResponse += `\n\n🗑️ I've deleted ${deleteResult.deletedCount} event(s) for you! ${deleteResult.message}`;
            // Trigger calendar refresh
            if (onCalendarRefresh) {
              onCalendarRefresh();
            }
          } else {
            botResponse += `\n\n❌ I couldn't delete those events: ${deleteResult.message}`;
          }
        } catch (error) {
          console.error('Error deleting events:', error);
          botResponse += `\n\n❌ I had trouble deleting those events. Please try again.`;
        }
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorText = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      if (error.message.includes('401')) {
        errorText = "API key is invalid. Please check your OpenAI API key.";
      } else if (error.message.includes('429')) {
        if (retryCount < 2) {
          // Show retry message
          const retryMessage = {
            id: Date.now() + 1,
            type: 'bot',
            text: `Rate limit hit. Retrying in 3 seconds... (Attempt ${retryCount + 1}/2)`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, retryMessage]);
          
          // Retry after a delay
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            sendMessage();
          }, 3000); // Wait 3 seconds before retry
          return;
        } else {
          errorText = "Rate limit exceeded. Please wait 2-3 minutes before trying again. You can also try shorter messages.";
          setRetryCount(0); // Reset retry count
        }
      } else if (error.message.includes('500')) {
        errorText = "OpenAI server error. Please try again later.";
      } else if (error.message.includes('Network')) {
        errorText = "Network error. Please check your internet connection.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return '';
  };

  return (
    <ImageBackground
      source={getBackgroundImage(weatherData, devModeOverrides)}
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={styles.backgroundImageStyle}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Activity Chat</Title>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherText}>{city} • {weatherData.temperature}°C</Text>
            <Text style={styles.backHintText}>Use back gesture to return</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.botMessage
              ]}
            >
              <View style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.botBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userText : styles.botText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.timestamp,
                  message.type === 'user' ? styles.userTimestamp : styles.botTimestamp
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={[styles.messageBubble, styles.botBubble]}>
                <Text style={[styles.messageText, styles.botText]}>
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            placeholder="Chat with WeatherBot about anything..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.input}
            placeholderTextColor="#999"
            multiline
            theme={{
              colors: {
                primary: '#fff',
                surface: 'rgba(120,130,150,0.4)',
                onSurface: '#fff',
              },
            }}
          />
          <Button
            mode="contained"
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={styles.sendButton}
            contentStyle={styles.sendButtonContent}
            labelStyle={styles.sendButtonText}
            icon="send"
          >
            Send
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#000', // Prevent white flash
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
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
    marginBottom: 4,
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherText: {
    color: '#ccc',
    fontSize: 11,
  },
  backHintText: {
    color: 'rgba(120,130,150,1.0)',
    fontSize: 9,
    marginTop: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 0, // Prevent layout issues
  },
  messagesContent: {
    paddingVertical: 20,
    paddingBottom: 10, // Extra padding for keyboard
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  botBubble: {
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.4)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#ccc',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'rgba(120,130,150,0.5)',
    borderRadius: 25,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(173, 216, 230, 0.6)',
  },
  sendButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ActivityChatScreen;