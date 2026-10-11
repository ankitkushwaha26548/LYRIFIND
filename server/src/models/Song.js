/** Song model: metadata + lyrics. Indexed on the fields users search by. */
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    artist: { type: String, required: true, trim: true, maxlength: 100 },
    album: { type: String, trim: true, maxlength: 100, default: '' },
    language: { type: String, trim: true, maxlength: 40, default: '' },
    genre: { type: String, trim: true, maxlength: 40, default: '' },
    year: { type: Number, min: 1800, default: null },
    lyrics: { type: String, required: true, maxlength: 20000 },
  },
  { timestamps: true }
);

songSchema.index({ title: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ language: 1, genre: 1 });

module.exports = mongoose.model('Song', songSchema);
