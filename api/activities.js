// Vercel Serverless Function for AI Activity Suggestions
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { weather, city, timeOfDay } = req.body;

    if (!weather || !city) {
      return res.status(400).json({ error: 'Weather data and city are required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Prepare context for AI
    const weatherContext = {
      temperature: weather.main.temp,
      condition: weather.weather[0].main,
      description: weather.weather[0].description,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      timeOfDay: timeOfDay,
      city: city
    };

    // Create AI prompt
    const prompt = `You are a helpful AI assistant that suggests activities based on weather conditions and time of day. 

Current weather in ${city}:
- Temperature: ${weatherContext.temperature}°C
- Condition: ${weatherContext.condition} (${weatherContext.description})
- Humidity: ${weatherContext.humidity}%
- Wind Speed: ${weatherContext.windSpeed} m/s
- Time of Day: ${getTimeOfDayDescription(timeOfDay)}

Please suggest 5-7 diverse activities that would be suitable for this weather and time. Include both indoor and outdoor options when appropriate.

Return your response as a JSON object with this structure:
{
  "activities": [
    {
      "name": "Activity Name",
      "description": "Brief description of the activity",
      "category": "outdoor/indoor/sports/entertainment/food/shopping/cultural/relaxation",
      "duration": "1-2 hours" (optional)
    }
  ],
  "recommendation": "Your top recommendation with brief explanation"
}

Make the suggestions practical, diverse, and consider the weather conditions.`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that suggests activities based on weather and time. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiData = await openaiResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    // Parse AI response
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback suggestions if AI response is not valid JSON
      suggestions = getFallbackSuggestions(weatherContext);
    }

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Activities API error:', error);
    
    // Return fallback suggestions on error
    const fallbackSuggestions = getFallbackSuggestions({
      temperature: weather?.main?.temp || 20,
      condition: weather?.weather?.[0]?.main || 'clear',
      timeOfDay: timeOfDay || 12
    });
    
    res.status(200).json(fallbackSuggestions);
  }
}

function getTimeOfDayDescription(hour) {
  if (hour < 6) return 'Early Morning';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

function getFallbackSuggestions(weatherContext) {
  const { temperature, condition, timeOfDay } = weatherContext;
  
  const suggestions = {
    activities: [],
    recommendation: "Based on the current weather, here are some great activity options!"
  };

  // Temperature-based suggestions
  if (temperature > 25) {
    suggestions.activities.push(
      { name: "Visit a Pool", description: "Cool off at a local swimming pool", category: "outdoor", duration: "2-3 hours" },
      { name: "Ice Cream Tour", description: "Try different ice cream shops around the city", category: "food", duration: "1-2 hours" }
    );
  } else if (temperature < 10) {
    suggestions.activities.push(
      { name: "Hot Chocolate Cafe", description: "Warm up with a cozy hot chocolate", category: "indoor", duration: "1 hour" },
      { name: "Museum Visit", description: "Explore local museums and galleries", category: "cultural", duration: "2-4 hours" }
    );
  }

  // Weather condition-based suggestions
  if (condition.toLowerCase().includes('rain')) {
    suggestions.activities.push(
      { name: "Indoor Cinema", description: "Watch a movie at a local theater", category: "entertainment", duration: "2-3 hours" },
      { name: "Cooking Class", description: "Learn to cook a new dish", category: "indoor", duration: "2-3 hours" }
    );
  } else if (condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sunny')) {
    suggestions.activities.push(
      { name: "Park Walk", description: "Take a leisurely walk in a local park", category: "outdoor", duration: "1-2 hours" },
      { name: "Outdoor Sports", description: "Play tennis, basketball, or soccer", category: "sports", duration: "1-2 hours" }
    );
  }

  // Time-based suggestions
  if (timeOfDay < 12) {
    suggestions.activities.push(
      { name: "Morning Coffee", description: "Visit a local coffee shop", category: "food", duration: "30-60 minutes" },
      { name: "Farmer's Market", description: "Browse local produce and goods", category: "shopping", duration: "1-2 hours" }
    );
  } else if (timeOfDay >= 18) {
    suggestions.activities.push(
      { name: "Evening Restaurant", description: "Try a new restaurant for dinner", category: "food", duration: "1-2 hours" },
      { name: "Live Music", description: "Check out local live music venues", category: "entertainment", duration: "2-3 hours" }
    );
  }

  // Fill up to 5-7 activities
  const additionalActivities = [
    { name: "Bookstore Browsing", description: "Explore local bookstores", category: "indoor", duration: "1-2 hours" },
    { name: "Art Gallery", description: "Visit local art galleries", category: "cultural", duration: "1-2 hours" },
    { name: "Spa Day", description: "Relax with a massage or spa treatment", category: "relaxation", duration: "2-3 hours" },
    { name: "Shopping Mall", description: "Browse shops and stores", category: "shopping", duration: "2-4 hours" }
  ];

  while (suggestions.activities.length < 5 && additionalActivities.length > 0) {
    const randomIndex = Math.floor(Math.random() * additionalActivities.length);
    suggestions.activities.push(additionalActivities.splice(randomIndex, 1)[0]);
  }

  return suggestions;
}
