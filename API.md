# postpg - API Reference

- [`Postpg` object](#postpg-object)
  - [`new Postpg([config])`](#new-postpgconfig)
  - [`postpg.destroy()`](#postpgdestroy)
  - [`postpg.query(sql, [params], callback)`](#postpgquerysql-params-callback)
  - [`postpg.find(sql, [params], callback)`](#postpgfindsql-params-callback)
  - [`postpg.findOne(sql, [params], callback)`](#postpgfindonesql-params-callback)
  - [`Postpg` events](#postpg-events)
    - [`postpg.on('debug', (data) => {...})`](#postpgondebug-data--)
- [Transactions](#transactions)
  - [`postpg.createTransaction()`](#postpgcreatetransaction)
  - [`transaction.push(sql, [params])`](#transactionpushsql-params)
  - [`transaction.run(callback)`](#transactionruncallback)
  - [Transaction events](#transaction-events)
    - [`transaction.on('debug', (data) => {...})`](#transactionondebug-data--)

## `Postpg` object

When you `require('postpg')`, you obtain a reference to the `Postpg` class.
Instances of `Postpg` encapsulate the connection info and
provide all the functionality of the module.

### `new Postpg([config])`

Creates a new client.

- `config` - optional object with the following properties:
  - `user` (default: `process.env.PGUSER`)
  - `password` (default: `process.env.PGPASSWORD`)
  - `database` (default: `process.env.PGDATABASE`)
  - `host` (default: `process.env.PGHOST`)
  - `port` (default: `process.env.PGPORT`)

```js
const Postpg = require('postpg');

const postpg = new Postpg({
  user: 'brianc',
  password: 'boom!',
  database: 'test',
  host: 'example.com',
  port: 5313,
});
```

### `postpg.destroy()`

Closes the underlying connection pool.

If you've got scripts that don't immediately exit after they've finished
executing your logic, it's probably because node is waiting for the connections
in the connection pool to timeout. Calling this method solves that issue.

> Note: The `postpg` instance should not be used after `.destroy()` is called.

```js
const Postpg = require('postpg');
const postpg = new Postpg();

postpg.findOne('select getdate()', (err, row) => {

  postpg.destroy();  // we don't plan on using the postpg client again

  // technically throwing the error will immediately end the process as well
  // even if we didn't call destroy()
  if (err) {
    throw err;
  }

  console.log(row.getdate);
});
```

### `postpg.query(sql, [params], callback)`

Run a SQL query by deferring to
[Client#query methods](https://github.com/brianc/node-postgres/wiki/Client)
from the `pg` module.

Use this function if you need access to the result metadata;
if you just need the row objects returned by the query,
use `postpg.find()` or `postpg.findOne()` instead.

> Note: Unlike the methods on Query objects from the `pg` module,
>       `postpg.query()` doesn't return an EventEmitter;
>       you must use the callback interface.
>       Furthermore, the callback will always be called.

- `sql`
  - SQL string if making a
    [simple query](https://github.com/brianc/node-postgres/wiki/Client#simple-queries)
  - Parameterized SQL string or config object if making a
    [parameterized query](https://github.com/brianc/node-postgres/wiki/Client#parameterized-queries)
  - Config object if making a
    [prepared statement](https://github.com/brianc/node-postgres/wiki/Client#prepared-statements)
- `params` - optional array of parameters for a parameterized query
- `callback` - callback function with signature `(err, result)`
  - For details on the result, see the
    [`pg` docs](https://github.com/brianc/node-postgres/wiki/Query#result-object)
    ...however, there are undocumented fields available, such as the `fields`
    property that gives additional metadata about the column types in the result
    set returned by the SQL query. Running `example/query.js` from this repo
    will log a complete example of the object returned.

```js
const Postpg = require('postpg');
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
```

### `postpg.find(sql, [params], callback)`

Like `postpg.query`,
but only returns the `rows` property from the query result.

If there are no rows returned, the result will be an empty array.

```js
const Postpg = require('postpg');
const postpg = new Postpg();

postpg.find('select * from information_schema.tables', (err, rows) => {

  postpg.destroy();

  if (err) {
    throw err;
  }

  console.log(`${rows.length} rows returned:`);
  rows.forEach((row) => console.log(row.table_name));
});
```

### `postpg.findOne(sql, [params], callback)`

Like `postpg.query`,
but only returns the first item in the `rows` property from the query result.

If there are no rows returned, the result will be `undefined`.

```js
const Postpg = require('postpg');
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
    console.log('No tables found with a name like that.');
  }
  else {
    console.log('First table name is: ' + row.table_name);
  }
});
```

### Postpg events

`Postpg` inherits from `Events.EventEmitter` and emits the following events:

#### `postpg.on('debug', (data) => {...})`

Emits status/debug data for connections, queries, and any transactions created
by the client.

```js
const Postpg = require('postpg');
const postpg = new Postpg();

// log ndjson to stdout
postpg.on('debug', (data) => console.log(JSON.stringify(data)));

postpg.findOne('select getdate()', (err, result) => postpg.destroy());
```

## Transactions

postpg provides basic transaction support.


### `postpg.createTransaction()`

### `transaction.push(sql, [params])`

### `transaction.run(callback)`

### Transaction events

Transaction objects are instances of `Events.EventEmitter`
and emit the following events:

#### `transaction.on('debug', (data) => {...})`
