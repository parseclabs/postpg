'use strict';

const Events = require('events');

const Pg = require('pg');

const Connection = require('./lib/connection');
const Transaction = require('./lib/transaction');


class Postpg extends Events.EventEmitter {

  constructor(config) {

    super();

    const env = {
      user:      process.env.PGUSER,
      password:  process.env.PGPASSWORD,
      database:  process.env.PGDATABASE,
      host:      process.env.PGHOST,
      port:      process.env.PGPORT,
    };

    this.config = Object.assign({}, env, config || {});
  }

  _connect(callback) {

    const connection = new Connection();
    connection.on('debug', (data) => this._debug(data));
    return connection.connect(this.config, callback);
  }

  _debug(data) {

    return this.emit('debug', data);
  }

  _parseArgs(params, callback) {

    if (callback == null) {
      return { params: [], callback: params };
    }
    else if (params == null) {
      return { params: [], callback: callback };
    }
    else {
      return { params: params, callback: callback };
    }
  }

  createTransaction() {

    const transaction = new Transaction(this.config);
    transaction.on('debug', (data) => this._debug(data));
    return transaction;
  }

  destroy() {

    return Pg.end();
  }

  find(sql, params, callback) {

    const args = this._parseArgs(params, callback);

    this.query(sql, args.params, (err, result) => {

      if (err) {
        return args.callback(err);
      }

      return args.callback(null, result.rows);
    });
  }

  findOne(sql, params, callback) {

    const args = this._parseArgs(params, callback);

    this.find(sql, args.params, (err, rows) => {

      if (err) {
        return args.callback(err);
      }

      return args.callback(null, rows[0]);
    });
  }

  query(sql, params, callback) {

    const args = this._parseArgs(params, callback);

    this._connect((err, connection) => {

      if (err) {
        return args.callback(err);
      }

      return connection.query(sql, args.params, (err, result) => {

        connection.close();
        return args.callback(err, result);
      });
    });
  }
}


module.exports = Postpg;
