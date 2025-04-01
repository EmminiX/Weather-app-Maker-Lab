const mongoose = require('mongoose');

const senseHatDataSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true,
    min: -40,
    max: 120
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pressure: {
    type: Number,
    required: true,
    min: 300,
    max: 1100
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  device: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Raspberry Pi SenseHat'
    },
    location: {
      type: String,
      default: 'Unknown'
    }
  }
}, {
  timestamps: true,
  // Add index for efficient queries
  indexes: [
    { timestamp: -1 },
    { 'device.id': 1 }
  ]
});

// Add validation for reasonable value ranges
senseHatDataSchema.pre('save', function(next) {
  if (this.temperature < -40 || this.temperature > 120) {
    next(new Error('Temperature reading out of reasonable range'));
  }
  if (this.humidity < 0 || this.humidity > 100) {
    next(new Error('Humidity reading out of reasonable range'));
  }
  if (this.pressure < 300 || this.pressure > 1100) {
    next(new Error('Pressure reading out of reasonable range'));
  }
  next();
});

module.exports = mongoose.model('SenseHatData', senseHatDataSchema);