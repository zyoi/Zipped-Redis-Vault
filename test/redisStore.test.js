const chai = require('chai');
const assert = chai.assert;
const RedisStore = require('../index'); // Update the path accordingly
const {encrypt, decrypt} = require('../encryption'); // Update the path accordingly
const crypto = require('crypto-js');
const cfg = require('../config');
const zlib = require('zlib');
describe('RedisStore', function () {

  before(async function () {
    // Code to setup a test Redis instance or mock the Redis client.
    // Wait for Redis connection if you are using a real Redis instance.
    await RedisStore.waitForConnection();
    await RedisStore.set('testKey', null)
  });

  describe('#set() and #get()', function () {
    it('should store and retrieve data properly', async function () {
      const key = 'testKey';
      const value = {test: 'value'};

      await RedisStore.set(key, value);
      const retrievedValue = await RedisStore.get(key);

      assert.deepEqual(retrievedValue, value);
    });

    it('should store encrypted data if key is in secretKeys', async function () {
      const secretKey = cfg.secretKeys[0]; // Assuming the cfg has at least one secretKey
      const value = 'testValue';

      await RedisStore.set(secretKey, value);
      const rawRetrievedData = await RedisStore.client.get(`keyv:${secretKey}`);

      // Now, we'll simulate the processing done by the 'get' method in the RedisStore
      let processedData = JSON.parse(rawRetrievedData);

      if (processedData._compressed) {
        const buffer = Buffer.from(processedData._compressed);
        let decompressed = zlib.gunzipSync(buffer).toString();

        if (cfg.secretKeys.includes(secretKey)) {
          decompressed = decrypt(decompressed);
        }

        processedData = JSON.parse(decompressed);
      }

      assert.equal(processedData, value);
    });
  });

  // Additional tests for watcher etc. can be added here
});

describe('Encryption', function () {
  it('should encrypt and decrypt data properly', function () {
    const secret = 'testSecret';
    process.env.secret = secret;

    const plainText = 'Hello World';
    const encryptedText = encrypt(plainText);
    const decryptedText = decrypt(encryptedText);

    assert.notEqual(encryptedText, plainText, 'Encrypted text should be different from plain text');
    assert.equal(decryptedText, plainText, 'Decrypted text should match the original plain text');
  });
});
