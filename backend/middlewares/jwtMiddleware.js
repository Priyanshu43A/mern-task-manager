const dotenv = require("dotenv");
const User = require("../models/User");
dotenv.config();
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const passport = require("passport");

// extract the cookie
const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.authorization;
  }

  return token;
};

let opts = {
  jwtFromRequest: ExtractJWT.fromExtractors([
    ExtractJWT.fromAuthHeaderAsBearerToken(),
    cookieExtractor,
  ]),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JWTStrategy(opts, async function (jwtPayload, done) {
    try {
      const user = await User.findById(jwtPayload._id).select("-password");
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.log(`Error in authentication via jwt ${error}`);
      return done(error);
    }
  })
);