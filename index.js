const redis = require('redis');
const zlib = require('zlib');
const encryption = require('./encryption');
const config = require('./config')

/**
 * Class representing a RedisStore.
 */
class RedisStore {
  /**
   * Create a RedisStore instance.
   */
  constructor() {
    this.client = redis.createClient();
    this.connected = false;
    this.client.on('error', err => console.error('Redis Client Error', err));
    this.client.connect().then(() => this.connected = true);

    if (!config.secret) {
      console.warn('No secret key for key-value storage');
    }
  }

  /**
   * Wait until Redis is connected.
   * @returns {Promise<void>} Resolves when Redis is connected.
   */
  async waitForConnection() {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        if (this.connected) {
          clearInterval(intervalId);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Retrieve value from Redis by key.
   * @param {string} key - The key.
   * @returns {Promise<any>} The value associated with the key.
   */
  async get(key) {
    if (!this.connected) await this.waitForConnection();

    try {
      let result = await this.client.get(`keyv:${key}`);

      try {
        result = JSON.parse(result);
        if (result._compressed) {
          const buffer = Buffer.from(result._compressed);
          let decompressed = zlib.gunzipSync(buffer).toString();

          if (config.secretKeys.includes(key)) {
            decompressed = encryption.decrypt(decompressed);
          }

          result = JSON.parse(decompressed);
        }
      } catch (e) {
        if (result || result === null) return result;
        console.error(e);
      }

      return result.value || result;
    } catch (error) {
      console.error(`Couldn't get key ${key}`);
      return null;
    }
  }

  /**
   * Set value in Redis by key.
   * @param {string} key - The key.
   * @param {any} value - The value to set.
   * @returns {Promise<void>} Resolves when value is set.
   */
  async set(key, value) {
    if (!this.connected) await this.waitForConnection();

    let serializedValue = JSON.stringify(value);

    if (config.secretKeys.includes(key)) {
      serializedValue = encryption.encrypt(serializedValue);
    }

    const userBuffer = Buffer.from(serializedValue);
    const compressedValue = {_compressed: zlib.gzipSync(userBuffer)};

    this.client.set(`keyv:update_time:${key}`, new Date().toString());
    return this.client.set(`keyv:${key}`, JSON.stringify(compressedValue));
  }

  /**
   * Watch a key for updates.
   * @param {string} key - The key to watch.
   * @param {boolean} logTime - If true, logs the update time.
   * @param {Function} callback - Function to call when the key is updated.
   */
  watcher(key, logTime, callback) {
    let savedUpdateTime;

    const checkForKeyUpdates = async () => {
      const updateTime = await this.get(`update_time:${key}`);

      if (savedUpdateTime !== updateTime) {
        const response = await this.get(key);
        callback(response);

        savedUpdateTime = updateTime;
        if (logTime) console.log(`${key}'s new update_time: ${updateTime}`);
      }

      setTimeout(checkForKeyUpdates, 1000);
    };

    checkForKeyUpdates();
  }
}

module.exports = new RedisStore();
