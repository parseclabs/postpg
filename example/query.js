const Postpg = require('..');
const postpg = new Postpg();

const createSql = 'create table postpg_ex (message text)';
const insertSql = `insert into postpg_ex (message) values ('hello world')`;
const dropSql = 'drop table postpg_ex';

postpg.query(createSql, (err, result) => {

  if (err) {
    throw err;
  }

  console.log(result);

  postpg.query(insertSql, (err, result) => {

    if (err) {
      throw err;
    }

    console.log(result);
    console.log(`inserted ${result.rowCount} rows`);

    postpg.query(dropSql, (err, result) => {

      postpg.destroy();

      if (err) {
        throw err;
      }

      console.log(result);
    });
  });
});
