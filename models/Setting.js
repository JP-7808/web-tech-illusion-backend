const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'url', 'email', 'phone', 'image', 'number', 'boolean'],
    default: 'text'
  },
  group: {
    type: String,
    default: 'general'
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

SettingSchema.index({ key: 1 }, { unique: true });
SettingSchema.index({ group: 1, order: 1 });

module.exports = mongoose.model('Setting', SettingSchema);
