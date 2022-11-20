const db = require('../index')

//db.watcher('accounts', true, console.log)
db.set('accounts', 'dxcb').then(() => {
  db.get('accounts').then(console.log).catch(console.error)
}).catch(console.error)