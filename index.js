const app_root = require('app-root-path');
require('dotenv').config({path: app_root + '/dev.env'})
const CFG = require('./cfg');
const redis = require('redis');
const client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);
const zlib = require('zlib');
const setAsync = promisify(client.set).bind(client);
const {secret_keys} = CFG;
const CryptoJS = require('crypto-js');
const Console = require("console");

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

    if (secret_keys.hasOwnProperty(key)) do_stuff(key, res, true)


    return res
  } catch (e) {
    //console.error(e)
    console.error(`Couldn't get key ${key}`)
    return null;
  }
};

const do_stuff = (key, value, do_decryption) => {

  if (!process.env.secret || !Array.isArray(value)) return;

  for (let item of value) {
    for (let variable_name of secret_keys[key]) {

      if (!item.hasOwnProperty(variable_name)) continue;

      const www = item[variable_name];
      //console.log(variable_name, www)
      try {
        let sec = process.env.secret
        let v = do_decryption ?
          CryptoJS.AES.decrypt(www, sec).toString(CryptoJS.enc.Utf8) :
          CryptoJS.AES.encrypt(www, sec).toString()

        if (v === '') return;

        item[variable_name] = v;
      } catch (e) {
        console.error(e)
      }
    }
  }
}

const set = async (key, value) => {
  if (!connected)
    await wait_for_connection()

  if (secret_keys.hasOwnProperty(key))
    do_stuff(key, value, false)

  value = JSON.stringify(value)
  const userBuffer = new Buffer.from(value)
  const _compressed = zlib.gzipSync(userBuffer)
  value = {_compressed}

  client.set(`keyv:update_time:${key}`, Date().toString());

  return client.set(`keyv:${key}`, JSON.stringify(value));
};

module.exports = {
  get, set
}