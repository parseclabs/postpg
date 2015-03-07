// postpg

var Uuid = require('uuid');

var NOOP = function () {};

exports.Client = function (Pg, Bole, config) {

  if (config == null) {
    config = Bole;
    Bole = null;
  }

  this.Pg = Pg;
  this.config = config;

  if (Bole == null) {
    this.log = { debug: NOOP, info: NOOP, warn: NOOP, error: NOOP };
  }
  else {
    this.log = Bole('postpg');
  }
};

exports.Client.prototype.connect = function (callback) {

  // callback signature is (err, client, done)
  this.Pg.connect(this.config, callback);
};

exports.Client.prototype.getRaw = function (sql, params, callback) {

  var self = this;
  var uuid = Uuid.v4();

  self.log.debug({
    uuid: uuid,
    message: 'submitted',
    sql: sql,
    params: params,
  });

  this.connect(function (err, client, done) {

    if (err) {
      self.log.debug({
        uuid: uuid,
        message: 'connection error',
        err: err,
      });
      return callback(err);
    }

    self.log.debug({
      uuid: uuid,
      message: 'connection success',
    });

    client.query(sql, params, function (err, raw) {

      done();

      if (err) {
        self.log.debug({
          uuid: uuid,
          message: 'query error',
          err: err,
        });
        return callback(err);
      }

      self.log.debug({
        uuid: uuid,
        message: 'query success',
      });

      callback(null, raw);
    });
  });
};

exports.Client.prototype.getOne = function (sql, params, callback) {

  this.getRaw(sql, params, function (err, raw) {

    if (err) {
      return callback(err);
    }

    callback(null, raw.rows[0]);
  });
};

exports.Client.prototype.getRows = function (sql, params, callback) {

  this.getRaw(sql, params, function (err, raw) {

    if (err) {
      return callback(err);
    }

    callback(null, raw.rows);
  });
};

exports.Client.prototype.getFunctionResults = function (sql, params, callback) {

  this.getRaw(sql, params, function (err, raw) {

    if (err) {
      return callback(err);
    }

    if (raw.rows.length < 1) {
      return callback(null, []);
    }

    var key = Object.keys(raw.rows[0])[0];

    var values = raw.rows.map(function (row) {

      var value = row[key];

      // trim off leading and closing parentheses
      value = value.slice(1, value.length - 1);

      return value.split(',');
    });

    callback(null, values);
  });
};
