import nc from 'next-connect';
import axios from 'axios';

const handler = nc();

handler.post(async (req, res) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are allowed' 
      });
    }

    // Validate required fields
    const { lat, lon } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing coordinates',
        message: 'Both latitude (lat) and longitude (lon) are required' 
      });
    }

    // Validate coordinate ranges
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return res.status(400).json({ 
        error: 'Invalid latitude',
        message: 'Latitude must be a number between -90 and 90' 
      });
    }
    
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
      return res.status(400).json({ 
        error: 'Invalid longitude',
        message: 'Longitude must be a number between -180 and 180' 
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    // If no API key, return sample data
    if (!apiKey) {
      console.log('OpenWeather API key not found, returning sample data');
      const sampleData = {
        location: "Sample City",
        temp: 25.5,
        description: "clear sky",
        humidity: 65,
        rainProbability: 15,
        alerts: []
      };
      
      return res.status(200).json({
        ok: true,
        data: sampleData,
        source: 'sample'
      });
    }

    console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);

    // Call OpenWeather free API endpoint
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Extract required data from OpenWeather response
    const location = weatherData.name;
    const temp = Math.round(weatherData.main.temp * 10) / 10; // Round to 1 decimal
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;

    // Generate random rain probability (0-100%)
    const rainProbability = Math.floor(Math.random() * 101);

    // Generate alerts based on conditions
    const alerts = [];
    
    // Check for rain-related alerts
    if (description.toLowerCase().includes('rain')) {
      alerts.push({
        event: "Heavy Rain Alert",
        description: "Heavy rainfall expected. Consider postponing outdoor farming activities and ensure proper drainage.",
        severity: "moderate"
      });
    }
    
    // Check for temperature alerts
    if (temp > 35) {
      alerts.push({
        event: "Heatwave Alert",
        description: "Extreme heat conditions detected. Ensure adequate irrigation and protect crops from heat stress.",
        severity: "high"
      });
    } else if (temp < 10) {
      alerts.push({
        event: "Cold Wave Alert",
        description: "Cold weather conditions detected. Consider protecting sensitive crops and adjusting irrigation schedules.",
        severity: "moderate"
      });
    }

    // Add rain probability alert if high
    if (rainProbability > 70) {
      alerts.push({
        event: "High Rain Probability",
        description: `High probability of rain (${rainProbability}%). Plan irrigation and harvesting activities accordingly.`,
        severity: "low"
      });
    }

    const responseData = {
      location,
      temp,
      description,
      humidity,
      rainProbability,
      alerts
    };

    console.log('Successfully fetched weather data from OpenWeather API');

    res.status(200).json({
      ok: true,
      data: responseData,
      source: 'openweather'
    });

  } catch (error) {
    console.error('Weather API error:', error);
    
    // Handle specific OpenWeather API errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'Invalid API key',
        message: 'Please check your OPENWEATHER_API_KEY environment variable' 
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'API rate limit exceeded',
        message: 'Please try again later' 
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'Invalid coordinates',
        message: 'Please check the latitude and longitude values' 
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Location not found',
        message: 'No weather data available for the provided coordinates' 
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Unable to connect to weather service' 
      });
    }

    // Generic error fallback
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred' 
    });
  }
});

export default handler;