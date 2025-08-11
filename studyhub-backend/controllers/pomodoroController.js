const PomodoroSession = require('../models/PomodoroSession');

exports.getAll = async (req, res) => {
  try {
    const sessions = await PomodoroSession.find().sort({ createdAt: -1 }).limit(200);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { mode, start, end } = req.body;
    if (!mode || !start || !end) {
      return res.status(400).json({ message: 'mode, start and end are required' });
    }
    const s = new PomodoroSession({ mode, start: new Date(start), end: new Date(end) });
    const saved = await s.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeAll = async (req, res) => {
  try {
    await PomodoroSession.deleteMany({});
    res.json({ message: 'All sessions cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
