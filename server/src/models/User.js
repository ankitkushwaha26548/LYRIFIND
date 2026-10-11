/**
 * User model. `favorites` holds references (ObjectIds) to Song documents,
 * which gives each user a private "saved lyrics" list.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // never returned by default
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
