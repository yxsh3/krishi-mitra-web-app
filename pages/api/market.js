import nc from 'next-connect';
import axios from 'axios';

const handler = nc();

// Mock market data - Replace with real Agmarknet/data.gov.in API integration
// TODO: Integrate with https://agmarknet.gov.in/ or https://data.gov.in/ for real-time mandi prices
const getMockMarketData = (commodity) => {
  const commodityLower = commodity.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  
  // Seeded data for different commodities
  const mockData = {
    'wheat': {
      commodity: 'Wheat',
      mandiPrices: [
        {
          market: 'Delhi (Azadpur)',
          min: 2150,
          max: 2250,
          modal: 2200,
          date: today
        },
        {
          market: 'Punjab (Khanna)',
          min: 2100,
          max: 2200,
          modal: 2150,
          date: today
        },
        {
          market: 'Haryana (Karnal)',
          min: 2120,
          max: 2220,
          modal: 2170,
          date: today
        }
      ],
      trend: 'rising'
    },
    'rice': {
      commodity: 'Rice',
      mandiPrices: [
        {
          market: 'Andhra Pradesh (Kurnool)',
          min: 1850,
          max: 1950,
          modal: 1900,
          date: today
        },
        {
          market: 'West Bengal (Burdwan)',
          min: 1800,
          max: 1900,
          modal: 1850,
          date: today
        },
        {
          market: 'Tamil Nadu (Thanjavur)',
          min: 1820,
          max: 1920,
          modal: 1870,
          date: today
        }
      ],
      trend: 'stable'
    },
    'tomato': {
      commodity: 'Tomato',
      mandiPrices: [
        {
          market: 'Maharashtra (Pune)',
          min: 25,
          max: 35,
          modal: 30,
          date: today
        },
        {
          market: 'Karnataka (Bangalore)',
          min: 20,
          max: 30,
          modal: 25,
          date: today
        },
        {
          market: 'Tamil Nadu (Coimbatore)',
          min: 22,
          max: 32,
          modal: 27,
          date: today
        }
      ],
      trend: 'falling'
    },
    'onion': {
      commodity: 'Onion',
      mandiPrices: [
        {
          market: 'Maharashtra (Lasalgaon)',
          min: 1800,
          max: 2000,
          modal: 1900,
          date: today
        },
        {
          market: 'Karnataka (Hassan)',
          min: 1700,
          max: 1900,
          modal: 1800,
          date: today
        },
        {
          market: 'Gujarat (Rajkot)',
          min: 1750,
          max: 1950,
          modal: 1850,
          date: today
        }
      ],
      trend: 'rising'
    },
    'potato': {
      commodity: 'Potato',
      mandiPrices: [
        {
          market: 'Uttar Pradesh (Agra)',
          min: 12,
          max: 18,
          modal: 15,
          date: today
        },
        {
          market: 'West Bengal (Hooghly)',
          min: 10,
          max: 16,
          modal: 13,
          date: today
        },
        {
          market: 'Punjab (Jalandhar)',
          min: 11,
          max: 17,
          modal: 14,
          date: today
        }
      ],
      trend: 'stable'
    }
  };

  // Return specific commodity data or default to wheat
  return mockData[commodityLower] || mockData['wheat'];
};

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
    const { commodity } = req.body;
    
    if (!commodity || typeof commodity !== 'string') {
      return res.status(400).json({ 
        error: 'Commodity required',
        message: 'Commodity name is required and must be a string' 
      });
    }

    const marketApiKey = process.env.MARKET_API_KEY;
    const marketApiUrl = process.env.MARKET_API_URL;

    // If no real market API configured, return mock data
    if (!marketApiKey || !marketApiUrl) {
      console.log('Market API not configured, returning mock data');
      const mockData = getMockMarketData(commodity);
      
      return res.status(200).json({
        ok: true,
        data: mockData,
        source: 'mock'
      });
    }

    console.log(`Fetching market data for commodity: ${commodity}`);

    // Call real market API (Agmarknet/data.gov.in integration)
    const marketUrl = `${marketApiUrl}?commodity=${encodeURIComponent(commodity)}&api_key=${marketApiKey}`;
    
    const marketResponse = await axios.get(marketUrl, {
      timeout: 10000 // 10 second timeout
    });

    const marketData = marketResponse.data;

    // Process real market API response
    const processedData = {
      commodity: marketData.commodity || commodity,
      mandiPrices: marketData.mandiPrices ? marketData.mandiPrices.map(mandi => ({
        market: mandi.market || mandi.mandi_name,
        min: parseFloat(mandi.min_price) || 0,
        max: parseFloat(mandi.max_price) || 0,
        modal: parseFloat(mandi.modal_price) || 0,
        date: mandi.date || new Date().toISOString().split('T')[0]
      })) : [],
      trend: marketData.trend || 'stable'
    };

    console.log('Successfully fetched market data from API');

    res.status(200).json({
      ok: true,
      data: processedData,
      source: 'api'
    });

  } catch (error) {
    console.error('Market API error:', error);
    
    // Handle specific market API errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'Invalid API key',
        message: 'Please check your MARKET_API_KEY environment variable' 
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
        error: 'Invalid request',
        message: 'Please check the commodity name and API configuration' 
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Commodity not found',
        message: `No market data available for ${req.body.commodity}` 
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Unable to connect to market data service' 
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'Market data service took too long to respond' 
      });
    }

    // Fallback to mock data on any error
    console.log('Market API call failed, returning mock data as fallback');
    const mockData = getMockMarketData(req.body.commodity || 'wheat');
    
    res.status(200).json({
      ok: true,
      data: mockData,
      source: 'fallback',
      warning: 'Using mock data due to API error'
    });
  }
});

export default handler;
