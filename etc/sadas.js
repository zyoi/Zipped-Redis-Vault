const db = require('../index')

//db.watcher('accounts', true, console.log)
db.set('accounts', [{'as': 's'}]).then(() => {
  db.get('accounts').then(console.log).catch(console.error)
}).catch(console.error)