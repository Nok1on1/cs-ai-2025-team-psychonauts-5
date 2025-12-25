require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET_KEY,
    jwtExpiration: 86400,
    jwtRefreshExpiration: 86400,
};