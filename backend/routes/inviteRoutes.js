// inviteRoutes.js
const express = require('express');
const router = express.Router();
const { validateInviteToken, addUserToTeam } = require('../controllers/inviteControllers');
const sendResponse  = require("../utils/sendResponse");
const passport = require('passport');


// Route to handle when someone follows the invite link
router.get('/join/team', async (req, res) => {
   try {
      const { token } = req.query; // Extract the token from the URL query

      if (!token) {
         return res.status(400).json({ error: 'Invalid or missing invite token' });
      }

      // Step 1: Validate the invite token
      const invite = await validateInviteToken(token);

      if (!invite) {
         return res.status(400).json({ error: 'Invalid or expired invite link' });
      }

      // Step 2: Check if user is authenticated
      if (!req.isAuthenticated()) {
         // If not logged in, redirect to login with the token in the URL so it’s retained after login
         return res.redirect(`/api/user/login?redirect=/invite/join/team?token=${token}`);
      }

      // Step 3: Add the authenticated user to the team
      const userId = req.user.id;
      await addUserToTeam(userId, invite.teamId._id, token);

      // Step 4: Redirect the user to the team's dashboard
      //return res.redirect(`/team/${invite.teamId}`);
      sendResponse(res, 200, true, "You followed invitation link! check team requests..", { invite }, null);

   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
