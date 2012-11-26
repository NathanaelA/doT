// Generated by CoffeeScript 1.4.0
(function() {
  var argv, asyncCalls, asyncDone, asyncStarted, doT, flow, fs, path, readFile, readItem;

  fs = require('fs');

  path = require('path');

  flow = require('flow');

  doT = require('./doT.js');

  asyncCalls = 0;

  asyncStarted = function() {
    return asyncCalls += 1;
  };

  asyncDone = function() {
    asyncCalls -= 1;
    if (0 === asyncCalls) {
      return asyncAfterAll();
    }
  };

  readItem = function(item, callback) {
    return flow.exec(function() {
      return fs.stat(item, this);
    }, function(err, stat) {
      if (err) {
        process.stderr.write(err);
        return this();
      } else if (stat.isDirectory()) {
        return flow.exec(function() {
          return fs.readdir(item, this);
        }, function(err, files) {
          var _this = this;
          if (err) {
            process.stderr.write(err);
            return this();
          } else {
            return files.forEach(function(file) {
              return readItem(path.join(item, file), _this.MULTI());
            });
          }
        }, function() {
          return this();
        });
      } else {
        return readFile(item, this);
      }
    }, function() {
      return callback();
    });
  };

  readFile = function(file, callback) {
    return flow.exec(function() {
      return fs.readFile(file, this);
    }, function(err, data) {
      var f, id, rel;
      if (err) {
        process.stderr.write("Error reading file '" + file + "': '" + err + "\n");
      } else {
        id = path.basename(file, path.extname(file));
        if (argv.base) {
          rel = path.relative(argv.base, path.dirname(file)).replace(/\//g, '.');
          if (rel) {
            id = "" + rel + "." + id;
          }
        }
        try {
          f = doT.compile(data);
          doT.addCached(id, f);
        } catch (err) {
          process.stderr.write("Error compiling file '" + file + "': '" + err + "'\n");
        }
      }
      return this();
    }, function() {
      return callback();
    });
  };

  argv = require('optimist')["default"]({
    base: ''
  }).alias({
    base: 'b'
  }).argv;

  flow.exec(function() {
    var _this = this;
    return argv._.forEach(function(val, i) {
      return readItem(val, _this.MULTI());
    });
  }, function() {
    return process.stdout.write(doT.exportCached());
  });

}).call(this);