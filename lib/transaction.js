'use strict';


const Events = require('events');


const Async = require('async');
const Uuid = require('uuid');


const Connection = require('./connection');


class Transaction extends Events.EventEmitter {

  constructor(config) {

    super();

    this.id = Uuid.v4();
    this._config = config;
    this._queries = [];
  }

  _debug(data) {

    data.transactionId = this.id;
    return this.emit('debug', data);
  }

  push(sql, params) {

    this._queries.push({ sql: sql, params: params })
  }

  run(callback) {

    if (this._queries.length === 0) {
      return callback(new Error('nothing to do'));
    }

    const connection = new Connection();
    connection.on('debug', (data) => this._debug(data));
    connection.connect(this._config, (err, connection) => {

      if (err) {
        return callback(err);
      }

      const results = [];

      connection.query('begin', (err, beginResult) => {

        if (err) {
          connection.close();
          return callback(err);
        }

        results.push(beginResult);

        const rollback = function (err) {

          connection.query('rollback', (rollbackErr, rollbackResult) => {

            connection.close(rollbackErr);
            return callback(err);
          });
        };

        const iterator = function (query, iteratorCallback) {

          connection.query(query.sql, query.params, (iteratorErr, iteratorResult) => {

            if (err) {
              return iteratorCallback(iteratorErr);
            }

            results.push(iteratorResult);
            return iteratorCallback(null);
          });
        };

        Async.mapSeries(this._queries, iterator, (err) => {

          if (err) {
            return rollback(err);
          }

          connection.query('commit', (err, commitResult) => {

            connection.close(err);

            if (err) {
              return callback(err);
            }

            results.push(commitResult);
            return callback(null, results);
          });
        });
      });
    });
  }
}


module.exports = Transaction;
