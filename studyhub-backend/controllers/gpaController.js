const GpaRecord = require('../models/GpaRecord');

/**
 * Create GPA record. Expects body:
 * { courses: [{name, credits, grade}], gpa: number }
 */
exports.getAll = async (req, res) => {
  try {
    const records = await GpaRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { courses, gpa } = req.body;
    if (!Array.isArray(courses) || typeof gpa !== 'number') {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const record = new GpaRecord({ courses, gpa });
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const rec = await GpaRecord.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Record not found' });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await GpaRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
