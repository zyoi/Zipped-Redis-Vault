const app_root = require('app-root-path');require('dotenv').config({path: app_root + '/dev.env'})const CFG = require('./cfg');const redis = require('redis');const client = redis.createClient();const {promisify} = require('util');const getAsync = promisify(client.get).bind(client);const setAsync = promisify(client.set).bind(client);const {secret_keys} = CFG;const CryptoJS = require('crypto-js');client.on('error', (error) => {  console.error(error);});const encrypt = (data) => CryptoJS.AES.encrypt(data, process.env.secret).toString(CryptoJS.enc.Utf8);const decrypt = (data) => CryptoJS.AES.decrypt(data, process.env.secret).toString(CryptoJS.enc.Utf8);const get = async (key) => {  try {    let res = await getAsync(`keyv:${key}`);    res = JSON.parse(res);    res = res.value || res;    if (secret_keys.hasOwnProperty(key))      do_stuff(key, res, true)    return res  } catch (e) {    console.error(e)    console.error(`Couldn't get key ${key}`)    return null;  }};const do_stuff = (key, value, do_decryption) => {  if (!process.env.secret)    return  if (Array.isArray(value)) {    for (let item of value) {      secret_keys[key].forEach(variable_name => {        if (!item.hasOwnProperty(variable_name))          return        const www = item[variable_name];        let v = do_decryption ? decrypt(www) : encrypt(www)        if (v === '')          return;        item[variable_name] = v;      })    }  }};const set = (key, value) => {  if (secret_keys.hasOwnProperty(key))    do_stuff(key, value, false)  setAsync(`keyv:update_time:${key}`, Date().toString());  return setAsync(`keyv:${key}`, JSON.stringify(value));};module.exports = {  get,  set}get('csm_accounts_no_inv')