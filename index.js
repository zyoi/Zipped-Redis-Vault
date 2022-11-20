const app_root = require('app-root-path');
require('dotenv').config({path: app_root + '/dev.env'});
const CFG = require('./cfg');
const redis = require('redis');
const client = redis.createClient();
const zlib = require('zlib');
const {secret_keys} = CFG;
const encryption = require('./encryption');

client.on('error',
  (err) => console.log('Redis Client Error', err)
);

let connected = false;

client.connect().then(r => connected = true);

const wait_for_connection = () => new Promise(r => setInterval(() => {
  if (connected)
    return r();
}, 50));

if (!process.env.secret)
  console.warn('No secret key for key-value storage');

const get = async (key) => {
  if (!connected)
    await wait_for_connection()

  try {
    let res = await client.get(`keyv:${key}`);

    try {
      res = JSON.parse(res);
      if (res._compressed) {
        res = res._compressed
        const buffer = Buffer.from(res);
        res = zlib.gunzipSync(buffer)
        res = JSON.parse(res.toString())
      }
    } catch (e) {
      if (res || res === null)
        return res
      else
        console.error(e)
    }

    res = res.value || res;

    if (secret_keys.includes(key))
      res = encryption(key, res, true)

    return res
  } catch (e) {
    //console.error(e)
    console.error(`Couldn't get key ${key}`)
    return null;
  }
};

const set = async (key, value) => {
  if (!connected)
    await wait_for_connection()

  if (secret_keys.includes(key))
    value = encryption(key, value, false)

  value = JSON.stringify(value)
  const userBuffer = new Buffer.from(value)
  const _compressed = zlib.gzipSync(userBuffer)
  value = {_compressed}

  client.set(`keyv:update_time:${key}`, Date().toString());

  return client.set(`keyv:${key}`, JSON.stringify(value));
};

const watcher = (key, log_time, callback, saved_update_time) => {
  get('update_time:' + key).then(update_time => {
    if (saved_update_time !== update_time) {
      get(key).then(response => callback(response))
      saved_update_time = update_time

      if (log_time)
        console.log(`${key}'s new update_time: ${update_time}`)
    }

    setTimeout(() => watcher(key, log_time, callback, saved_update_time), 1000)
    //console.log('Updated ' + key)
  })
}

module.exports = {
  get, set, watcher, client
}