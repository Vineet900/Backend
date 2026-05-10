import axios from 'axios';
import { config } from '../config/index.js';

/**
 * @desc    Get AI Tutor response (Strict Production Mode)
 * @route   POST /api/tutor/chat
 */
export const askTutor = async (req, res, next) => {
  try {
    const { message, history = [], language = 'EN', level = 'Beginner' } = req.body;
    const apiKey = config.ai.openRouterKey;
    
    if (!apiKey) {
      return res.status(503).json({ 
        success: false, 
        message: 'AI Service currently unavailable. Please try again later.' 
      });
    }

    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'openai/gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are the DevSchool Pro AI Mentor. You help students learn web development. Language: ${language}. Level: ${level}. Keep responses concise and focused on coding.` 
          },
          ...history,
          { role: 'user', content: message }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': config.cors.origin,
          'X-Title': 'DevSchool Pro'
        },
        timeout: 15000 
      });

      res.status(200).json({
        success: true,
        reply: response.data.choices[0].message.content
      });
    } catch (aiError) {
      console.error('AI Provider Error:', aiError.response?.data || aiError.message);
      res.status(502).json({ 
        success: false, 
        message: 'The AI Mentor is taking a break. Please retry in a few seconds.' 
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Chat History
 * @route   GET /api/tutor/history
 */
export const getHistory = async (req, res, next) => {
  try {
    // For now, return empty history as DB table is not yet initialized in setup.sql
    // This prevents frontend errors while maintaining "ready" state
    res.status(200).json({
      success: true,
      history: []
    });
  } catch (err) {
    next(err);
  }
};
