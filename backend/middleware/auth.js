const config = require('../config/config');

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  // Skip authentication for GET requests in development
  if (config.environment === 'development' && req.method === 'GET') {
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'No API key provided' 
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(403).json({ 
      error: 'Authentication failed',
      message: 'Invalid API key' 
    });
  }

  next();
};

module.exports = { apiKeyAuth };