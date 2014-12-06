exports.Client = function (options) {

  this.Pg = options.Pg;
  this.pgConfig = options.pgConfig;
};

exports.Client.prototype.connect = function (callback) {

  // callback signature is (err, client, done)
  this.Pg.connect(this.pgConfig, callback);
};

exports.Client.prototype.getRaw = function (sql, params, callback) {

  this.Pg.connect(this.pgConfig, function (err, client, done) {

    if (err) {
      return callback(err);
    }

    client.query(sql, params, function (err, raw) {

      done();

      if (err) {
        return callback(err);
      }

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
