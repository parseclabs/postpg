const Postpg = require('..');
const postpg = new Postpg();

// log ndjson to stdout
postpg.on('debug', (data) => console.log(JSON.stringify(data)));

postpg.findOne('select getdate()', (err, result) => postpg.destroy());
