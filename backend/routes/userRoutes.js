const express = require('express');
const { signup, verifyUser, login, getUserInvites } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const passport = require("passport");


const ensureAuthentication = passport.authenticate('jwt', {session: false});


router.post('/signup', signup);
router.post("/verification", verifyUser);
router.post("/login", login);
router.get('/invites', ensureAuthentication, getUserInvites);
router.get("/auth", ensureAuthentication, (req,res)=>{
    res.json({
        message: "welcome to the protected route",
        success: true,
        status: 200,
        data: req.user,
    })
})  


module.exports = router;
