const CryptoJS = require("crypto-js");module.exports = (key, value, do_decryption) => {  if (!process.env.secret)    return value  let result  try {    let secret = process.env.secret    result = do_decryption ?      CryptoJS.AES.decrypt(value, secret).toString(CryptoJS.enc.Utf8) :      CryptoJS.AES.encrypt(value, secret).toString()    if (result === '')      return value  } catch (e) {    console.error(e)  }  return result}