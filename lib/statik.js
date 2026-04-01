import connect from 'connect';
import compression from 'compression';
import cors from 'cors';
import serveStatic from 'serve-static';
import { spawn } from 'node:child_process';
import { getPortNumberForPath } from './get-port.js';


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
  const options = { ...defaults, ...opts };
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

  var server = app.listen(options.port, options.expose ? undefined : 'localhost');
  return new Promise((resolve, reject) => {
    server.once('listening', () => resolve({app, server, options, url}));
    server.once('error', reject);
  });
};

export default statik;
