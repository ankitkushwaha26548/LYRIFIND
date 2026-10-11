/** Per-user favorites, stored as an array of Song ids on the User document. */
const mongoose = require('mongoose');
const User = require('../models/User');
const Song = require('../models/Song');
const AppError = require('../utils/AppError');

async function list(userId) {
  const user = await User.findById(userId).populate({ path: 'favorites', select: '-lyrics' });
  return user ? user.favorites : [];
}

async function add(userId, songId) {
  if (!mongoose.isValidObjectId(songId) || !(await Song.exists({ _id: songId }))) throw new AppError(404, 'Song not found');
  // The condition lives in the filter, so the check-and-add is ONE atomic operation:
  // if the song is already in the array the filter matches nothing (matchedCount 0).
  const res = await User.updateOne({ _id: userId, favorites: { $ne: songId } }, { $addToSet: { favorites: songId } });
  if (res.matchedCount === 0) throw new AppError(409, 'Song is already in favorites');
}

async function remove(userId, songId) {
  if (!mongoose.isValidObjectId(songId)) throw new AppError(404, 'Song is not in favorites');
  const res = await User.updateOne({ _id: userId, favorites: songId }, { $pull: { favorites: songId } });
  if (res.matchedCount === 0) throw new AppError(404, 'Song is not in favorites');
}

module.exports = { list, add, remove };
