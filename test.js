const db = require('./index');const log = console.log.bind(console);(async () => {  await db.set('test', [{test: 'awoo'}])  log(await db.get('test'))})()