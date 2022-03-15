var path = require('path');
var extend = require('extend');
var connect = require('connect');
var compression = require('compression');
var cors = require('cors');
var serveStatic = require('serve-static');
const { spawn } = require('child_process');

const {getPortNumberForPath} = require('./get-port.js');


var defaults = {
  /* connect options */
  port: 0,

  open: false,

  /* connect.static options */
  root: process.cwd(),
  maxAge: 0,
  dotfiles: 'deny',

  /* other options */
  compress: true,
  cors: false,
  coi: false,
};

function statik(opts) {
  const explicitPort = opts.port || process.env.PORT;
  var options = extend(Object.create(null), defaults, opts);
  const automagicPort = getPortNumberForPath(options.root);
  options.port = explicitPort || automagicPort;

  const url = `http://localhost:${options.port}`;

  // Open in a webbrowser
  if (options.open) {
    // Note that I'm not really handling child processes. This kinda assumes we invoke Chrome only for Chrome to reuse the existing Chrome process that's already up.
    const child = spawn('open', [url], {stdio: 'inherit'});
  }

  // start the app on given port.
  var app = connect();

  // setup middlewares
  if (options.compress) app.use(compression());
  if (options.cors) app.use(cors());

  if (options.coi) {
    app.use(function(req, res, next) {
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      next();
    });
  }


  var static = serveStatic(options.root, options);
  app.use(static);

  var server = app.listen(options.port, options.expose ? undefined : 'localhost');
  console.log(`🤓 Served by statikk: ${url}`);
  return {app, server, port: options.port, url};
};

module.exports = statik;