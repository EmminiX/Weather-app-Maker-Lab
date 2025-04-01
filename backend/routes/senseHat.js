const express = require('express');
const router = express.Router();
const SenseHatData = require('../models/SenseHatData');
const { apiKeyAuth } = require('../middleware/auth');

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get latest reading
router.get('/data', asyncHandler(async (req, res) => {
  const data = await SenseHatData.findOne()
    .sort({ timestamp: -1 })
    .select('-__v');

  if (!data) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'No sensor data available'
    });
  }

  res.json(data);
}));

// Get historical data with pagination and filtering
router.get('/data/history', asyncHandler(async (req, res) => {
  const {
    hours = 24,
    limit = 100,
    page = 1,
    deviceId
  } = req.query;

  const query = {
    timestamp: {
      $gte: new Date(Date.now() - hours * 60 * 60 * 1000)
    }
  };

  if (deviceId) {
    query['device.id'] = deviceId;
  }

  const [data, total] = await Promise.all([
    SenseHatData.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-__v'),
    SenseHatData.countDocuments(query)
  ]);

  res.json({
    data,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }
  });
}));

// Post new reading (requires API key)
router.post('/data', apiKeyAuth, asyncHandler(async (req, res) => {
  const {
    temperature,
    humidity,
    pressure,
    device
  } = req.body;

  // Validate required fields
  if (!temperature || !humidity || !pressure || !device?.id) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required fields'
    });
  }

  const senseHatData = new SenseHatData({
    temperature,
    humidity,
    pressure,
    device: {
      id: device.id,
      name: device.name || 'Raspberry Pi SenseHat',
      location: device.location || 'Unknown'
    }
  });

  const savedData = await senseHatData.save();
  res.status(201).json(savedData);
}));

// Get device statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const { deviceId, days = 7 } = req.query;

  const query = {
    timestamp: {
      $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }
  };

  if (deviceId) {
    query['device.id'] = deviceId;
  }

  const stats = await SenseHatData.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$device.id',
        deviceName: { $first: '$device.name' },
        location: { $first: '$device.location' },
        avgTemperature: { $avg: '$temperature' },
        minTemperature: { $min: '$temperature' },
        maxTemperature: { $max: '$temperature' },
        avgHumidity: { $avg: '$humidity' },
        avgPressure: { $avg: '$pressure' },
        readingCount: { $sum: 1 },
        lastReading: { $max: '$timestamp' }
      }
    }
  ]);

  res.json(stats);
}));

module.exports = router;