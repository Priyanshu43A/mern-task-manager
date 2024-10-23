const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'completed', 'failed'], default: 'active' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  category: { type: String },
  deadline: { type: Date },
  AssignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  AssignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isCompleted: {type: Boolean, default: false},
  isPending: {type: Boolean, default: false},
  isActive: {type: Boolean, default: false},
});

module.exports = mongoose.model('Task', taskSchema);
