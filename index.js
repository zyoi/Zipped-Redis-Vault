const app_root = require('app-root-path');
require('dotenv').config({path: app_root + '/dev.env'})
const CFG = require('./cfg');
const redis = require('redis');
const client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const {secret_keys} = CFG;
const CryptoJS = require('crypto-js');
client.on('error', (error) => {
  console.error(error);
});

const get = async (key) => {
  try {
    let res = await getAsync(`keyv:${key}`);
    res = JSON.parse(res);

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

const set = (key, value) => {
  if (secret_keys.hasOwnProperty(key)) do_stuff(key, value, false)

  setAsync(`keyv:update_time:${key}`, Date().toString());

  return setAsync(`keyv:${key}`, JSON.stringify(value));
};

module.exports = {
  get, set
}