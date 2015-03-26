# postpg

Minimal wrapper around
[brianc/node-postgres (`pg`)](https://github.com/brianc/node-postgres),
specific to a few common use cases. Your mileage may vary.

## why

Sometimes you just want to roll your own queries when talking to PostgreSQL.
node-postgres is a great module for that,
except it can be annoying to continuously pass the connection options around
and it's likely you might forget to call `done()` once in awhile.
That's pretty much all this module does for you, plus some syntax sugar.

## fine print

* You have to `require` your own copy of node-postgres.
* Callback style queries are used for simplicity. If you want to stream results by row, [node-postgres can do that for you](https://github.com/brianc/node-postgres/wiki/Query).

## usage

First, create a client instance
by bringing your own `pg` instance
and specifying the config for it
([see the docs for details](https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client)):

```js
var Pg = require('pg');
var Postpg = require('postpg');

var config = {
  user: 'brianc',
  password: 'boom!',
  database: 'test',
  host: 'example.com',
  port: 5313,
};

var client = new Postpg.Client({
  Pg: Pg,
  config: config,
});
```

Now you can use the client's methods to query to database.

## client methods

### `getRaw(query, params, callback)`

### `getRows(query, params, callback)`

### `getOne(query, params, callback)`
