const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library
const dotenv = require('dotenv');
dotenv.config();


const generateToken = (res, id) => {
    const secretKey = process.env.JWT_SECRET; // Use a secure key
    const token = jwt.sign({ id: id }, secretKey, { expiresIn: '30d' }); // Create a JWT
    res.cookie('token', token, { httpOnly: true, secure: true }); // Set cookie with token
}


 

module.exports = {generateToken};