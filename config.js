const dotenv = require('dotenv');
const path = require('path');
const appRoot = require('app-root-path');

// Load environment variables from .env file
dotenv.config({path: path.join(appRoot.toString(), '/dev.env')});

// Parse secretKeys, removing any extra whitespace around each key
const parseSecretKeys = (keysString) => {
  return keysString.split(',')
    .filter(Boolean) // Remove any empty strings from the array
    .map(key => key.trim()); // Trim whitespace from each key
};

// The cfg module will export an object containing the configuration variables
module.exports = {
  secret: process.env.secret,
  secretKeys: parseSecretKeys(process.env.secretKeys || ''),
  logSecretKeys: process.env.logSecretKeys === 'true'
};

if (module.exports.secretKeys.length > 0 && process.env.logSecretKeys === 'true')
  console.log(`Secret keys have been set: ${module.exports.secretKeys.join(', ')}`);
else if (process.env.logSecretKeys === 'true')
  console.log('No secret keys have been set.');
