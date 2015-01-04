var mongoose = require('mongoose');

var User = mongoose.model('User', {
  login: { type: String, unique: true },
  password: String
});


module.exports = User;