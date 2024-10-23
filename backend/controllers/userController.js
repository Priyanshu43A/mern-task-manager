const User = require('../models/User');
const { verifyUserEmail } = require('../mailers/verifyUserEmail'); // Corrected import

const mongoose = require("mongoose");

const crypto = require("crypto");
const Otp = require("../models/otpSchema");
 
const passwordHelper = require("../utils/passwordHelper");
const { generateOTP } = require("../utils/generateOtp");

const jwt = require("jsonwebtoken");
const { setInitialProfilePicture } = require("../utils/setInitialProfilePicture");
const sendResponse = require('../utils/sendResponse');
const {generateToken, setTokenCookie } = require('../utils/cookieHelper');
const {body, validationResult} = require('express-validator');
const rateLimit = require('express-rate-limit'); // Import rate limiting library
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Rate limiting middleware for signup and login
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many signup attempts, please try again later."
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many login attempts, please try again later."
});

// Sign-up handler
const signup = async (req, res) => {
    try {
      // Extracting fields from request body
      const { email, password, username, name } = req.body; // Add this line

      // Validate inputs
      await body('email').isEmail().withMessage('Invalid email').run(req);
      await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);
      await body('username')
        .matches(/^(?!.*[ .])[a-zA-Z0-9_.]+[a-zA-Z0-9]$/)
        .withMessage('Username must not contain spaces or special characters and must start and end with a letter or number')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters long')
        .run(req);
      await body('name').notEmpty().withMessage('Name is required').run(req);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, "Validation errors", null, errors.array());
      }
  
      // Check if a user with the same email already exists
      const user = await User.findOne({ $or: [{ email }, { username }] }); // Ensure to check both email and username
      if (user) {
        if (!user.isVerified) {
          // If user exists but is not verified, resend OTP for verification
          const otp = await generateOTP(user._id);
          user.otp = otp;
          await user.save();
          verifyUserEmail(user, otp);
          return sendResponse(
            res,
            400,
            false,
            "Please verify your email to continue",
            null,
            null
          );
        }
        return sendResponse(
          res,
          409,
          false,
          "Account already exists",
          null,
          null
        );
      }

     
  
      // Hash the password
      const hashedPassword = await passwordHelper.hashingPasswordFunction(password);
      // Generate OTP for email verification
      const otp = await generateOTP();
      // Set initial profile image based on the user's name
      const profileImage = setInitialProfilePicture(name);
  
      // Create new user with provided details
      const newUser = await User.create({
        name,
        username,
        email,
        password: hashedPassword,
        authToken: crypto.randomBytes(32).toString("hex"),
        otp,
        profileImage,
      });
  
      // Send verification email
      verifyUserEmail(newUser, otp);
      return sendResponse(
        res,
        200,
        true,
        `Otp sent to ${email}`,
        { email }, // Added data field
        null
      );
    } catch (error) {
      console.log(error)
      return sendResponse(res, 500, false, "Internal server error", null, { error });
    }
  };

const verifyUser = async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return sendResponse(
          res,
          400, // Changed status code to 400 for bad request
          false,
          "Email or otp not found",
          null,
          null
        );
      }
      const user = await User.findOne({ email });
      if (!user) {
        return sendResponse(
            res,
            404,
            false,
            `User not found`,
            null,
            null
          );
      }
  
      if (user.otp.toString() !== otp) {
        return sendResponse(res, 400, false, "Otp mismatch", null, null); // Changed status code to 400
      }
      user.isVerified = true;
      await user.save();

      const token = await jwt.sign(user.toJSON(), process.env.JWT_SECRET_KEY);
      res.cookie("authorization", token, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 3600000 * 24 * 30, // 30 days
        sameSite: "Strict", // Helps prevent CSRF attacks
      });

      return sendResponse(
        res,
        200,
        true,
        "Email verified successfully",
        null,
        null
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Otp verification failed", null, { error });
    }
  };
  
const login = async (req, res) => {
    try {
        // Validate inputs
        await body('usernameOrEmail').notEmpty().withMessage('Username or email is required').run(req);
        await body('password').notEmpty().withMessage('Password is required').run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }

        const { usernameOrEmail, password } = req.body; // Extract the input fields

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { email: usernameOrEmail },
                { username: usernameOrEmail }
            ]
        });

        if (!user) {
            return sendResponse(res, 400, false, "User not found", null, null);
        }

        // Check if user is verified
        if (!user.isVerified) {
            const otp = await generateOTP(user._id);
            verifyUserEmail(user, otp);
            return sendResponse(res, 400, false, "Please verify your email to continue", null, null); // Added response for unverified user
        }

        const isMatched = await passwordHelper.compareHashedPasswordFunction(password, user.password);
        if (!isMatched) {
            return sendResponse(res, 400, false, "Password mismatch", null, null);
        }

        const token = await jwt.sign(user.toJSON(), process.env.JWT_SECRET_KEY);
        res.cookie("authorization", token, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 3600000 * 24 * 30, // 30 days
            sameSite: "Strict", // Helps prevent CSRF attacks
        });

        return sendResponse(res, 200, true, "Login successful", { token }, null);
    } catch (error) {
        return sendResponse(res, 500, false, "Error in login", null, { error });
    }
};

const getUserInvites = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'Invalid user ID format.');
        }

        const user = await User.findById(userId).select('-password -otp -authToken -Admin -Employee -BossTasks -EmployeeTasks').populate({
            path: 'requests',
        });

        if (!user) {
            return sendResponse(res, 404, false, "User not found!");
        }

        sendResponse(res, 200, true, { user });

    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, 'Error getting user invites.', {}, { error: error.message });
    }
};


 

  


 module.exports = {signup, verifyUser, login, getUserInvites};
