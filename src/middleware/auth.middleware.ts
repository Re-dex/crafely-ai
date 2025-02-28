import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.config';
import { ApiResponse } from '../types';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers[config.auth.apiKeyHeader];

  if (!apiKey) {
    const response: ApiResponse = {
      success: false,
      error: 'API key is required'
    };
    return res.status(401).json(response);
  }

  // TODO: Implement API key validation against database or secure storage
  // For now, we'll just pass through
  
  next();
};