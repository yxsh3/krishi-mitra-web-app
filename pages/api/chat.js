import nc from 'next-connect';
import { GoogleGenerativeAI } from '@google/generative-ai';

const handler = nc();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-pro',
  generationConfig: {
    responseMimeType: "application/json",
  }
});

// JSON Schema for structured response
const responseSchema = {
  type: "object",
  properties: {
    advice_text: {
      type: "string",
      description: "Detailed farming advice based on the user's question and location"
    },
    fertilizer: {
      type: "string", 
      description: "Recommended fertilizer or soil amendment for the specific crop and conditions"
    },
    pest_flags: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Array of potential pests or diseases to watch out for"
    },
    suggestions: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Array of actionable farming suggestions and best practices"
    }
  },
  required: ["advice_text", "fertilizer", "pest_flags", "suggestions"]
};

handler.post(async (req, res) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate required fields
    const { message, lang, lat, lon, crop } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    // Validate location data if provided
    if (lat && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
      return res.status(400).json({ 
        error: 'Latitude must be a number between -90 and 90' 
      });
    }
    
    if (lon && (typeof lon !== 'number' || lon < -180 || lon > 180)) {
      return res.status(400).json({ 
        error: 'Longitude must be a number between -180 and 180' 
      });
    }

    // Build context-aware prompt
    let prompt = `You are an expert agricultural advisor. Please provide farming advice based on the following information:\n\n`;
    prompt += `Question: ${message}\n\n`;
    
    if (crop) {
      prompt += `Crop: ${crop}\n`;
    }
    
    if (lat && lon) {
      prompt += `Location: Latitude ${lat}, Longitude ${lon}\n`;
    }
    
    if (lang) {
      prompt += `Language preference: ${lang}\n`;
    }
    
    prompt += `\nPlease provide your response in the following JSON format:\n`;
    prompt += `- advice_text: Detailed farming advice\n`;
    prompt += `- fertilizer: Recommended fertilizer or soil amendment\n`;
    prompt += `- pest_flags: Array of potential pests/diseases to watch for\n`;
    prompt += `- suggestions: Array of actionable farming suggestions\n\n`;
    prompt += `Consider the location, crop type, and season when providing advice. Be specific and practical.`;

    console.log('Sending request to Gemini AI with prompt:', prompt.substring(0, 200) + '...');

    // Generate content with Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Raw response from Gemini:', text.substring(0, 200) + '...');

    let parsedResponse;

    try {
      // Try to parse the JSON response directly
      parsedResponse = JSON.parse(text);
      
      // Validate that all required fields are present
      if (!parsedResponse.advice_text || !parsedResponse.fertilizer || 
          !Array.isArray(parsedResponse.pest_flags) || !Array.isArray(parsedResponse.suggestions)) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      console.warn('Failed to parse JSON response, attempting to extract JSON block:', parseError.message);
      
      // Try to extract JSON from the response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.warn('Failed to parse extracted JSON:', extractError.message);
          // Fallback to raw text
          parsedResponse = {
            advice_text: text,
            fertilizer: "Please consult with a local agricultural expert for specific fertilizer recommendations.",
            pest_flags: ["Unable to identify specific pests from the response"],
            suggestions: ["Review the advice above and consult local agricultural resources"]
          };
        }
      } else {
        // No JSON found, use raw text as fallback
        parsedResponse = {
          advice_text: text,
          fertilizer: "Please consult with a local agricultural expert for specific fertilizer recommendations.",
          pest_flags: ["Unable to identify specific pests from the response"],
          suggestions: ["Review the advice above and consult local agricultural resources"]
        };
      }
    }

    console.log('Successfully processed response');

    res.status(200).json({
      ok: true,
      data: parsedResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific Gemini AI errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({ 
        error: 'Invalid API configuration',
        message: 'Please check your GEMINI_API_KEY environment variable'
      });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return res.status(429).json({ 
        error: 'API quota exceeded',
        message: 'Please try again later'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default handler;
