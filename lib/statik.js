'use strict';

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
  jsprof: false,
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


  if (options.jsprof) {
    app.use(function(req, res, next) {
      res.setHeader("document-policy", "js-profiling");
      next();
    }); 
  }

  if (options.coi) {
    app.use(function(req, res, next) {
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      next();
    });
  }

  app.use(serveStatic(options.root, options));

  var server = app.listen(options.port, options.expose ? undefined : '0.0.0.0');
  return new Promise((resolve, reject) => {
    server.once('listening', resolve({app, server, options, url}));
    server.once('error', reject);
  });
};

module.exports = statik;
