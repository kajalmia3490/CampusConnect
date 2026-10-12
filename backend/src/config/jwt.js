require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'campus_connect_jwt_secret_key_sdp03_bubt_2026!',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
