const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 10 },
  description: {type: String, minlength: 30 },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  boss: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Pending employee requests
  createdAt: { type: Date, default: Date.now }, // Field to store creation date
  updatedAt: { type: Date, default: Date.now }, // Field to store last update date
  isActive: { type: Boolean, default: true } // Field to indicate if the team is active

});

module.exports = mongoose.model('Team', teamSchema);
