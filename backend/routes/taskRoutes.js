const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const passport = require("passport");
const { createTask } = require('../controllers/taskController');


const ensureAuthentication = passport.authenticate('jwt', {session: false});

router.post("/create", ensureAuthentication, createTask);


module.exports = router;