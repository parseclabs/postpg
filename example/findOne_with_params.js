const Postpg = require('..');
const postpg = new Postpg();

const sql = `
  select *
    from information_schema.tables
   where table_name like $1
   order by table_name asc
   limit 1
`;

const params = [ 'pg_%' ];

postpg.findOne(sql, params, (err, row) => {

  postpg.destroy();

  if (err) {
    throw err;
  }
  else if (row == null) {
    console.log('Table not found.');
  }
  else {
    console.log('First table name is: ' + row.table_name);
  }
});
