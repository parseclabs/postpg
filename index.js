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

  _debug(data) {

    return this.emit('debug', data);
  }

  _connect(callback) {

    const connection = new Connection();
    connection.on('debug', (data) => this._debug(data));
    return connection.connect(this.config, callback);
  };

  createTransaction() {

    const transaction = new Transaction(this.config);
    transaction.on('debug', (data) => this._debug(data));
    return transaction;
  }

  destroy() {

    return Pg.end();
  }

  find(sql, params, callback) {

    this.query(sql, params, (err, result) => {

      if (err) {
        return callback(err);
      }

      return callback(null, result.rows);
    });
  }

  findOne(sql, params, callback) {

    this.find(sql, params, (err, rows) => {

      if (err) {
        return callback(err);
      }

      return callback(null, rows[0]);
    });
  };

  query(sql, params, callback) {

    this._connect((err, connection) => {

      if (err) {
        return callback(err);
      }

      return connection.query(sql, params, (err, result) => {

        connection.close();
        return callback(err, result);
      });
    });
  }
};


module.exports = Postpg;
