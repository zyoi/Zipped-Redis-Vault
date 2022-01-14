const db = require('./index');
const log = console.log.bind(console);

(async () => {
  log(await db.get('testwe'))
  await db.set('testwe', [{test: 'awoo'}])

  log(await db.get('testwe'))
})()