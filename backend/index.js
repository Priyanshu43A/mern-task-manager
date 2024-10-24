const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv').config();
const passport = require('passport');
const cors = require("cors");

const app = express();


const cookieParser = require("cookie-parser");
const passportJwtStrategy = require("./middlewares/jwtMiddleware");
app.use(passport.initialize());
 
app.use(cookieParser());

// // Import routes
 const userRoutes = require('./routes/userRoutes');
 const teamRoutes = require('./routes/teamRoutes');
 const taskRoutes = require('./routes/taskRoutes');
 const inviteRoutes = require('./routes/inviteRoutes');



const corsOptions = {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionsSuccessStatus: 200,
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  };
  
  app.use(cors(corsOptions));

connectDB();
app.use(express.urlencoded({ extended: true })); // For form-data
app.use(express.json());

const isAuthenticated = passport.authenticate('jwt', {session: false});
 

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/invite', isAuthenticated, inviteRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

