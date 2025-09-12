import nc from 'next-connect';

const handler = nc();

handler.post(async (req, res) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate required fields
    const { type, message, rating, userInfo } = req.body;
    
    if (!type || !message) {
      return res.status(400).json({ 
        error: 'Type and message are required for feedback submission' 
      });
    }

    // Validate feedback type
    const validTypes = ['bug', 'feature', 'general', 'complaint', 'suggestion'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid feedback type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // TODO: Implement feedback storage
    // This could save to a database, send to email, or integrate with a feedback system
    // const feedbackData = {
    //   type,
    //   message,
    //   rating: rating || null,
    //   userInfo: userInfo || null,
    //   timestamp: new Date().toISOString(),
    //   ip: req.ip,
    //   userAgent: req.headers['user-agent']
    // };
    
    // await saveFeedback(feedbackData);

    // For now, return success response
    res.status(200).json({ 
      ok: true,
      message: 'Feedback API endpoint ready',
      feedbackType: type,
      // feedbackId: feedbackData.id // Uncomment when implementing actual storage
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default handler;
