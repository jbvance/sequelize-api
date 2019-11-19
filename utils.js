const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

const createAuthToken = function(user) {
    return jwt.sign({user}, process.env.JWT_SECRET, {
      subject: user.email,
      expiresIn: process.env.JWT_EXPIRY,
      algorithm: 'HS256'
    });
  };

  module.exports =  { createAuthToken };