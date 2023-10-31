const dotenv = require('dotenv');
const path = require('path');
const appRoot = require('app-root-path');

// Load environment variables from .env file
dotenv.config({ path: path.join(appRoot.toString(), '/dev.env') });

// Parse secretKeys, removing any extra whitespace around each key
const parseSecretKeys = (keysString) => {
  return keysString.split(',')
    .filter(Boolean) // Remove any empty strings from the array
    .map(key => key.trim()); // Trim whitespace from each key
};

// The cfg module will export an object containing the configuration variables
module.exports = {
  secret: process.env.SECRET, // It's a good practice to use uppercase for environment variables
  secretKeys: parseSecretKeys(process.env.SECRET_KEYS || ''),
  logSecretKeys: process.env.LOG_SECRET_KEYS === 'true',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379' // Default to local instance if not set
};

// Logging for debugging purposes (could be removed or modified for production use)
if (module.exports.secretKeys.length > 0 && module.exports.logSecretKeys) {
  console.log(`Secret keys have been set: ${module.exports.secretKeys.join(', ')}`);
} else if (module.exports.logSecretKeys) {
  console.log('No secret keys have been set.');
}

// Log the Redis URL (for debugging purposes, could be sensitive information)
if (module.exports.logSecretKeys) {
  console.log(`Redis URL: ${module.exports.redisUrl}`);
}
