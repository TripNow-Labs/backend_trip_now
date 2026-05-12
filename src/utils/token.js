const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const decryptedToken = async (authHeader) => {
  const [, token] = authHeader.split(' ');

  return promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

module.exports = { decryptedToken };
