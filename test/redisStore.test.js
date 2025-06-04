process.env.SECRET = 'testSecret';
process.env.SECRET_KEYS = 'secretKey';

const chai = require('chai');
const assert = chai.assert;
const RedisStore = require('../index');
const { encrypt, decrypt } = require('../encryption');
const cfg = require('../config');
const zlib = require('zlib');
const v8 = require('v8');
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
      const secretKey = cfg.secretKeys[0];
      const value = 'testValue';

      await RedisStore.set(secretKey, value);
      const rawRetrievedData = await RedisStore.client.getBuffer(`keyv:${secretKey}`);

      let decompressed = zlib.gunzipSync(rawRetrievedData).toString();
      if (cfg.secretKeys.includes(secretKey)) {
        decompressed = decrypt(decompressed);
      }
      const processedData = v8.deserialize(Buffer.from(decompressed, 'base64'));

      assert.equal(processedData, value);
    });

    it('should read legacy formatted values', async function () {
      const key = 'legacyKey';
      const value = { foo: 'bar' };

      // Manually store value using legacy format
      const serialized = JSON.stringify(value);
      const userBuffer = Buffer.from(serialized);
      const compressed = { _compressed: zlib.gzipSync(userBuffer) };
      await RedisStore.client.set(`keyv:${key}`, JSON.stringify(compressed));

      const result = await RedisStore.get(key);
      assert.deepEqual(result, value);
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
