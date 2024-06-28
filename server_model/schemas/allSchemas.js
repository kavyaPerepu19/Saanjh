const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  userId:{
    type: String,
    required: true,
    unique: true
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

let patientIdSchema = new mongoose.Schema({
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

let patientIdModel = mongoose.model('patientId', patientIdSchema);

let reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  week: { type: Number, required: true, min: 1, max: 52 },
  patientData:{
    type: Object,
  },
  reportData: {
    type: Object,
  },
  Prediction:{
    type:String,
  },
  DocNote:{
    type: String,
  },
  dietPlan:{
    type: Object,
  },

});

let reportsModel = mongoose.model('Report', reportSchema);

module.exports = {
  usersModel,
  patientIdModel,
  reportsModel
};
