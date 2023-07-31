const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');

// Create token
exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            profilePic: user.profilePic,
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
};
