require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/weather_dashboard',
  apiKey: process.env.API_KEY || 'default_api_key_please_change', // Default key for development
  environment: process.env.NODE_ENV || 'development'
};