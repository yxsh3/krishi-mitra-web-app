import nc from 'next-connect';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const handler = nc();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Disable body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Mock detection data based on file size parity
const getMockDetection = (fileSize) => {
  const isEven = fileSize % 2 === 0;
  
  if (isEven) {
    return {
      detections: [
        {
          label: 'aphid',
          confidence: 0.87,
          bbox: { x: 120, y: 80, width: 45, height: 35 }
        }
      ],
      suggestions: [
        'Aphids detected on your crop leaves',
        'Apply neem oil spray every 7-10 days',
        'Introduce beneficial insects like ladybugs',
        'Remove heavily infested leaves manually',
        'Ensure proper plant spacing for air circulation'
      ]
    };
  } else {
    return {
      detections: [
        {
          label: 'leaf spot',
          confidence: 0.92,
          bbox: { x: 200, y: 150, width: 60, height: 40 }
        }
      ],
      suggestions: [
        'Leaf spot disease identified on your plants',
        'Remove and destroy infected leaves immediately',
        'Apply copper-based fungicide spray',
        'Improve air circulation around plants',
        'Avoid overhead watering to prevent spread',
        'Ensure proper drainage to reduce humidity'
      ]
    };
  }
};

handler.use(upload.single('image'));

handler.post(async (req, res) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are allowed' 
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Image file required',
        message: 'Please upload an image file for pest detection' 
      });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const modelId = process.env.ROBOFLOW_MODEL;

    // If no API key or model, return mock data
    if (!apiKey || !modelId) {
      console.log('Roboflow API key or model not found, returning mock data');
      const mockData = getMockDetection(req.file.size);
      
      return res.status(200).json({
        ok: true,
        data: {
          filename: req.file.originalname,
          size: req.file.size,
          detections: mockData.detections,
          suggestions: mockData.suggestions,
          source: 'mock'
        }
      });
    }

    console.log(`Processing pest detection for image: ${req.file.originalname}`);

    // Prepare image for Roboflow API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call Roboflow detection API
    const roboflowUrl = `https://detect.roboflow.com/${modelId}?api_key=${apiKey}`;
    
    const roboflowResponse = await axios.post(roboflowUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 second timeout
    });

    const detectionData = roboflowResponse.data;

    // Process Roboflow response
    const detections = detectionData.predictions ? detectionData.predictions.map(pred => ({
      label: pred.class,
      confidence: Math.round(pred.confidence * 100) / 100,
      bbox: {
        x: Math.round(pred.x - pred.width / 2),
        y: Math.round(pred.y - pred.height / 2),
        width: Math.round(pred.width),
        height: Math.round(pred.height)
      }
    })) : [];

    // Generate suggestions based on detected pests
    const suggestions = [];
    const detectedLabels = detections.map(d => d.label.toLowerCase());
    
    if (detectedLabels.includes('aphid')) {
      suggestions.push(
        'Aphids detected - Apply neem oil spray every 7-10 days',
        'Introduce beneficial insects like ladybugs',
        'Remove heavily infested leaves manually'
      );
    }
    
    if (detectedLabels.includes('leaf spot') || detectedLabels.includes('leafspot')) {
      suggestions.push(
        'Leaf spot disease identified - Remove infected leaves',
        'Apply copper-based fungicide spray',
        'Improve air circulation around plants'
      );
    }
    
    if (detectedLabels.includes('whitefly')) {
      suggestions.push(
        'Whiteflies detected - Use yellow sticky traps',
        'Apply insecticidal soap spray',
        'Introduce natural predators like Encarsia wasps'
      );
    }
    
    if (detectedLabels.includes('spider mite')) {
      suggestions.push(
        'Spider mites detected - Increase humidity levels',
        'Apply miticide or neem oil treatment',
        'Remove heavily infested plant parts'
      );
    }

    // Add general suggestions if no specific pests detected
    if (suggestions.length === 0) {
      suggestions.push(
        'No specific pests detected in this image',
        'Continue regular monitoring of your crops',
        'Maintain good plant hygiene and spacing',
        'Consider preventive treatments during growing season'
      );
    }

    console.log('Successfully processed pest detection with Roboflow');

    res.status(200).json({
      ok: true,
      data: {
        filename: req.file.originalname,
        size: req.file.size,
        detections,
        suggestions,
        source: 'roboflow'
      }
    });

  } catch (error) {
    console.error('Pest detection API error:', error);
    
    // Handle specific Roboflow API errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'Invalid API key',
        message: 'Please check your ROBOFLOW_API_KEY environment variable' 
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
        message: 'Please check your image file and ROBOFLOW_MODEL configuration' 
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Unable to connect to pest detection service' 
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'Pest detection service took too long to respond' 
      });
    }

    // Fallback to mock data on any error
    console.log('Roboflow API call failed, returning mock data as fallback');
    const mockData = getMockDetection(req.file?.size || 1000);
    
    res.status(200).json({
      ok: true,
      data: {
        filename: req.file?.originalname || 'unknown',
        size: req.file?.size || 1000,
        detections: mockData.detections,
        suggestions: mockData.suggestions,
        source: 'fallback',
        warning: 'Using mock data due to API error'
      }
    });
  }
});

export default handler;
