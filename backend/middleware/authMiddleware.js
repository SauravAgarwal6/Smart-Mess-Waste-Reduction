const jwt = require('jsonwebtoken');
const User = require('../models/User'); // We need User to get the rollNo

module.exports = async function(req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if there's no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  // 3. If there is a token, verify it
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user's information from the token's payload to the request object
    // We also fetch the user's rollNo to use when creating a complaint
    const user = await User.findById(decoded.user.id).select('-password');
    req.user = {
        id: user.id,
        role: user.role,
        rollNo: user.rollNo
    };

    next(); // Move on to the next function (the actual route handler)
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};