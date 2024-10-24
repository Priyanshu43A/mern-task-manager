const express = require('express');
const router = express.Router();
const passport = require('passport');

const { protect } = require('../middlewares/authMiddleware');
const { createTeam, addEmployees, getTeamDetails, acceptInvite, removeEmployees, generateLink } = require('../controllers/teamController');

const ensureAuthentication = passport.authenticate('jwt', {session: false});


router.post('/create', ensureAuthentication, createTeam);
router.put('/team/add-employee', ensureAuthentication, addEmployees);
router.put('/team/remove-employee', ensureAuthentication, removeEmployees);
router.get('/team/:teamId', ensureAuthentication, getTeamDetails);
router.post('/team/accept-invite', ensureAuthentication, acceptInvite);
router.post('/team/invite', ensureAuthentication, generateLink);


 

module.exports = router;




