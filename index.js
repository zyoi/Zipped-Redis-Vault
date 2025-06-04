const redis = require('redis');
const zlib = require('zlib');
const v8 = require('v8');
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
    this.client = redis.createClient(config.redisUrl);
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
      const raw = await this.client.getBuffer(`keyv:${key}`);
      if (raw === null) return null;

      // Attempt to parse legacy JSON format
      try {
        const legacy = JSON.parse(raw.toString());
        if (legacy._compressed) {
          const buf = Buffer.from(legacy._compressed.data || legacy._compressed);
          let decompressed = zlib.gunzipSync(buf).toString();

          if (config.secretKeys.includes(key)) {
            decompressed = encryption.decrypt(decompressed);
          }

          return JSON.parse(decompressed);
        }
      } catch (e) {
        // not legacy JSON format, proceed
      }

      // New binary format
      let decompressed = zlib.gunzipSync(raw).toString();

      if (config.secretKeys.includes(key)) {
        decompressed = encryption.decrypt(decompressed);
      }

      try {
        return JSON.parse(decompressed);
      } catch (err) {
        return v8.deserialize(Buffer.from(decompressed, 'base64'));
      }
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

    let serialized = v8.serialize(value);
    let dataString = serialized.toString('base64');

    if (config.secretKeys.includes(key)) {
      dataString = encryption.encrypt(dataString);
    }

    const compressed = zlib.gzipSync(Buffer.from(dataString));

    this.client.set(`keyv:update_time:${key}`, new Date().toString());
    return this.client.set(`keyv:${key}`, compressed);
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
