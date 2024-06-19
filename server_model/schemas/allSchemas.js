const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true
  }
});

let usersModel = mongoose.model('User', userSchema);

let userIdSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
});

let userIdModel = mongoose.model('UserId', userIdSchema);

let reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  week: { type: Number, required: true, min: 1, max: 52 },
  reportData: {
    type: Object,
  }
});

let reportsModel = mongoose.model('Report', reportSchema);

module.exports = {
  usersModel,
  userIdModel,
  reportsModel
};
