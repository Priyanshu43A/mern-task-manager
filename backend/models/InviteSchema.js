// models/Invite.js
const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
   token: { type: String, required: true, unique: true },
   teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   expiresAt: { type: Date, required: true },
   maxUses: { type: Number, default: 1 },
   uses: { type: Number, default: 0 },
});

module.exports = mongoose.model('Invite', InviteSchema);
