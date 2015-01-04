var mongoose = require('mongoose');

var Session = mongoose.model('Session', {
  token: { type: String, unique: true },
  user: { type: String, unique: true },
  createdAt: Date,
  validUntil: Date
});


module.exports = Session;