var path = require('path');
var extend = require('extend');
var connect = require('connect');
var compression = require('compression');
var serveStatic = require('serve-static');

var defaults = {
  /* connect options */
  port: 8080,

  /* connect.static options */
  root: process.cwd(),
  maxAge: 0,
  dotfiles: 'deny',

  /* other options */
  compress: true
};

module.exports = function (opts) {
  var port = opts.port || (process.env.PORT || defaults.port);
  var options = extend(Object.create(null), defaults, opts);
  options.port = port;

  // start the app on given port.
  var app = connect();

  // setup middlewares
  if (options.compress) app.use(compression());

  var static = serveStatic(path.resolve(options.root), options);
  app.use(static);

  var server = app.listen(options.port, options.expose ? undefined : 'localhost');
  console.log(`Served by statikk: http://localhost:${options.port}`);

  return {app: app, server: server};
};
