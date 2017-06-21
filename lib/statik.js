var path = require('path');
var extend = require('extend');
var connect = require('connect');

var defaults = {
  /* connect options */
  port: 8080,

  /* connect.static options */
  root: process.cwd(),
  maxAge: 0,
  hidden: false,

  /* other options */
  compress: true
};

module.exports = function (opts) {
  var port = opts.port || (process.env.PORT || defaults.port);
  var options = extend(Object.create(null), defaults, opts);
  options.port = port;

  // setup middlewares
  var compress = connect.compress();
  var static = connect.static(path.resolve(options.root), options);

  // start the app on given port.
  var app = connect();


  app.use(compress);
  app.use(static);
  app.listen(options.port);
  console.log(`Served by statikk: http://localhost:${options.port}`);

  return app;
};
