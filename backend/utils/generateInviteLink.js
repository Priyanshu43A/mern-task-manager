// controllers/inviteController.js
const crypto = require('crypto');
const Invite = require('../models/InviteSchema');
const Team = require('../models/Team');
const dotenv = require("dotenv");
dotenv.config();

// Generate Invite Function
const generateInvite = async (teamId, userId) => {
    try {
       const token = crypto.randomBytes(20).toString('hex');
       const expiresAt = new Date();
       expiresAt.setDate(expiresAt.getDate() + 7);
 
       const invite = new Invite({
          token,
          teamId,
          createdBy: userId,
          expiresAt,
          maxUses: 10,
       });
 
       await invite.save();
 
       // Use environment variable for base URL or fallback to localhost for local development
       const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
 
       const inviteLink = `${baseUrl}/invite/join/team?token=${token}`;
       return inviteLink;
 
    } catch (error) {
       throw new Error('Error generating invite link');
    }
 };
 

module.exports = { generateInvite };
