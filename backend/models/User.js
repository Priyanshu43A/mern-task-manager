const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: {type: Number},
  authToken: {type: String},
  profileImage: { type: String },
  isVerified: {type: Boolean, default: false},
  Admin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  Employee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  BossTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  EmployeeTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  CompletedTAsks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  PendingTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const User = mongoose.model('User', userSchema); // Correct
module.exports = User;
