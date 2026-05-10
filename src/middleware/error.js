import { logger } from '../utils/logger.js';

/**
 * Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.path });

  // Supabase/PostgreSQL Errors
  if (err.code === '23505') {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Reference error: linked item not found' });
  }

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
