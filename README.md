# postpg

Minimal wrapper around
[brianc/node-postgres (`pg`)](https://github.com/brianc/node-postgres)

Sometimes you just want to roll your own queries when talking to PostgreSQL.
node-postgres is a great module for that,
except it can be annoying to continuously pass the connection options around
and it's likely you might forget to call `done()` once in awhile.
That's pretty much all this module does for you, plus some syntax sugar.

* You have to `require` your own copy of node-postgres.
* Callback style queries are used for simplicity. If you want to stream results by row,
  [node-postgres can do that for you](https://github.com/brianc/node-postgres/wiki/Query).

## `const postpg = new Postpg(config)`

Creates a client

([see the docs for details](https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client)):

```js
const Postpg = require('postpg');

const postpg = new Postpg(
  user: 'brianc',
  password: 'boom!',
  database: 'test',
  host: 'example.com',
  port: 5313,
});
```


## `postpg.query(sql, [params], callback)`



## `postpg.find(sql, [params], callback)`

Most common.

```js
const Postpg = require('postpg');
const postpg = new Postpg();

postpg.getRows('select * from employees', (err, rows) => {

    if (err) {
        throw err;
    }

    console.log(rows.length);

    rows.forEach((row) => {

        console.log(row.id);
        console.log(row.name);
    });
});
```


## `postpg.findOne(sql, [params], callback)`


```js
const Postpg = require('postpg');
const postpg = new Postpg();

postpg.getRows('select * from employees', (err, rows) => {

    if (err) {
        throw err;
    }

    console.log(rows.length);

    rows.forEach((row) => {

        console.log(row.id);
        console.log(row.name);
    });
});
```


## `const transaction = postpg.createTransaction()`



## `transaction.push(sql, [params])`


## `transaction.run(callback)`



## `Event: 'debug'`


```js
const Postpg = require('postpg');
const postpg = new Postpg();

postpg.on('debug', (data) => {

    // log debug information to stdout with a timestamp

    const timestamp = Date();
    const json = JSON.stringify(data);
    console.log(timestamp + '\t' + json);
});
```
