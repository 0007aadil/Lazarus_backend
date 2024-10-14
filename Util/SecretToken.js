require('dotenv').config();
const jwt = require('jsonwebtoken');

const createSecretToken = (id) => {
  if (!process.env.TOKEN_KEY) {
    throw new Error('TOKEN_KEY is not defined in the environment variables');
  }

  return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: '3d', // Token expires in 3 days
  });
};

module.exports = { createSecretToken };
