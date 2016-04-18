'use strict';


const Events = require('events');


const Pg = require('pg');
const NodeUuid = require('node-uuid');


const FORMAT_ERROR = function (err) {

  return {
    message: err.message,
    stack: err.stack,
  };
};


class Connection extends Events.EventEmitter {

  constructor() {

    super();

    this.id = NodeUuid.v4();
    this._client = null;
    this._done = null;
  }

  _debug(message, data) {

    const _data = {
      message: message,
      connectionId: this.id,
    };
    if (data) {
      if (data.queryId) {
        _data.queryId = data.queryId;
        delete data.queryId;
      }
      _data.data = data;
    }
    return this.emit('debug', _data);
  }

  close(err) {

    if (typeof this._done === 'function') {
      return this._done(err);
    }
  }

  connect(config, callback) {

    this._debug('connect start');
    Pg.connect(config, (err, client, done) => {

      if (err) {
        done();
        this._debug('connect error', { err: FORMAT_ERROR(err) });
        return callback(err);
      }

      this._client = client;
      this._done = done;
      this._debug('connect ok');
      return callback(null, this);
    });
  }

  query(sql, params, callback) {

    if (this._client == null) {
      throw new Error('query() called before connect()');
    }

    if (callback == null) {
      callback = params;
      params = [];
    }

    const debugData = {
      queryId: NodeUuid.v4(),
      sql: sql,
      params: params,
    };

    this._debug('query start', debugData);
    this._client.query(sql, params, (err, result) => {

      if (err) {
        debugData.err = FORMAT_ERROR(err);
        this._debug('query error', debugData);
        return callback(err);
      }

      this._debug('query ok', debugData);
      return callback(null, result);
    });
  }
}


module.exports = Connection;
