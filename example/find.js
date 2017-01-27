const Postpg = require('..');
const postpg = new Postpg();

postpg.find('select * from information_schema.tables', (err, rows) => {

  postpg.destroy();

  if (err) {
    throw err;
  }

  console.log(`${rows.length} rows returned:`);
  rows.forEach((row) => console.log(row.table_name));
});
