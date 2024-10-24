// inviteController.js
const Invite = require('../models/InviteSchema');
const Team = require("../models/Team");

// Validate the invite token
const validateInviteToken = async (token) => {
   const invite = await Invite.findOne({ token }).populate({
    path: "teamId",
    select: "name boss employees"
 });

   if (!invite) return null; // Token not found
   if (invite.expiresAt < Date.now()) return null; // Token has expired
   if (invite.uses >= invite.maxUses) return null; // Token has been used too many times

   return invite;
};

// Add the user to the team if the invite is valid
const addUserToTeam = async (userId, teamId, token) => {
   // Add the user to the team
   const team = await Team.findById(teamId);
   if (!team) throw new Error('Team not found');
   
   // Ensure the user isn't already part of the team
   if (team.employees.includes(userId) || team.requests.includes(userId)) {
      throw new Error('User is already part of the team');
   }

   if (team.boss.toString == userId) {
    throw new Error('User is already boss of the team');
 }

   // Add the user to the team
   team.requests.push(userId);
   await team.save();

   // Increment the invite's usage count
   const invite = await Invite.findOne({ token });
   invite.uses += 1;
   await invite.save();
};

module.exports = { validateInviteToken, addUserToTeam };
