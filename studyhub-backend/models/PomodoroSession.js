const mongoose = require('mongoose');

const PomodoroSchema = new mongoose.Schema({
  mode: { type: String, enum: ['work', 'short', 'long'], default: 'work' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PomodoroSession', PomodoroSchema);
