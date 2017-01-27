# postpg

Thin wrapper around
[brianc/node-postgres (`pg`)](https://github.com/brianc/node-postgres)
with basic transaction support.

See [API.md](API.md) for documentation and example usage.

__Features__:

* Keeps track of connection options for you
* Don't need to call `done()`
* Convenience methods for `SELECT` operations
* Basic transaction support

__Non-features__:

* No syntax for streaming results by row; you'll need to use
  [node-postgres directly](https://github.com/brianc/node-postgres/wiki/Query)
  for that.
