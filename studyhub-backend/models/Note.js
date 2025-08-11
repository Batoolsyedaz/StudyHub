const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: 'Untitled' },
    content: { type: String, trim: true, default: '' },
  },
  { timestamps: true }  // Automatically adds createdAt and updatedAt fields and manages updatedAt on save
);

module.exports = mongoose.model('Note', NoteSchema);
