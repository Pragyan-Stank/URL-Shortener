const jwt = require('jsonwebtoken');
const secret = 'your_custom_secret_code';

function setUser(user) {
  return jwt.sign({
    _id: user._id,
    email: user.email,
    role:user.role,
  },
    secret
  );
}

function getUser(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("Token verification failed:", error); // Log the error
    return null; // Return null if the token is invalid or missing
  }
}


module.exports = {
  setUser,
  getUser,
};
