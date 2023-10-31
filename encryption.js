const { AES, enc } = require("crypto-js");

/**
 * Encrypt a value using the provided key and the application secret.
 * @param {string} key - The key to use for encryption.
 * @param {string} value - The value to be encrypted.
 * @returns {string} Encrypted value or original value in case of an error.
 */
const encrypt = (key, value) => {
  try {
    if (!process.env.secret) {
      console.warn("Encryption secret is not set.");
      return value;
    }

    return AES.encrypt(value, process.env.secret).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return value;
  }
};

/**
 * Decrypt a value using the provided key and the application secret.
 * @param {string} key - The key to use for decryption.
 * @param {string} value - The value to be decrypted.
 * @returns {string} Decrypted value or original value in case of an error.
 */
const decrypt = (key, value) => {
  try {
    if (!process.env.secret) {
      console.warn("Decryption secret is not set.");
      return value;
    }

    const decryptedValue = AES.decrypt(value, process.env.secret).toString(enc.Utf8);

    return decryptedValue || value;
  } catch (error) {
    console.error("Decryption error:", error);
    return value;
  }
};

module.exports = {
  encrypt,
  decrypt
};
