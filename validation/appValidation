// Load modules
const { body } = require('express-validator') 

// Validate user input
function userValidation() {
  return [
    // Validate email format
    body('email')
    .isEmail()
    .escape()
    .withMessage('Must be a valid email address.'),
    // Validate password length
    body('password')
    .isLength({ min: 5 })
    .escape()
    .withMessage('Password must be at least 5 characters long.'),
    
    
  ];
};

// Export userValidation function
module.exports = 
  userValidation
