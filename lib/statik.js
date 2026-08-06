import connect from 'connect';
import compression from 'compression';
import cors from 'cors';
import serveStatic from 'serve-static';
import { spawn } from 'node:child_process';
import { getPortNumberForPath } from './get-port.js';

const defaults = {
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
  csp: undefined,
};

/** @import { ServeStaticOptions } from 'serve-static' */
/** @import { Server as HttpServer } from 'node:http' */
/** @import { Server as ConnectServer } from 'connect' */

/**
 * @typedef {object} StatikkCustomOpts
 * @property {number | string} [port]
 * @property {boolean} [open]
 * @property {string} [root]
 * @property {boolean} [compress]
 * @property {boolean} [cors]
 * @property {boolean} [coi]
 * @property {boolean} [jsprof]
 * @property {boolean} [expose]
 * @property {string} [csp]
 */

/**
 * @typedef {ServeStaticOptions & StatikkCustomOpts} StatikkOpts
 */

/**
 * @typedef {object} StatikkResult
 * @property {ConnectServer} app
 * @property {HttpServer} server
 * @property {StatikkOpts} options
 * @property {string} url
 */


/**
 * @param {string} url
 */
function openUrlInBrowser(url) {
  // Note that I'm not really handling child processes. This kinda assumes we invoke Chrome only for Chrome to reuse the existing Chrome process that's already up.
  spawn('open', [url], {stdio: 'inherit'});
}

/**
 * @param {StatikkOpts} [opts]
 * @returns {Promise<StatikkResult>}
 */
function statikk(opts = {}) {
  const portStr = (opts.port !== undefined ? String(opts.port) : process.env.PORT) || undefined;
  const explicitPort = portStr !== undefined ? Number(portStr) : undefined;
  const isExplicit = explicitPort !== undefined;
  const options = { ...defaults, ...opts };
  const automagicPort = getPortNumberForPath(options.root);
  options.port = isExplicit ? explicitPort : automagicPort;

  // start the app on given port.
  const app = connect();

  // setup middlewares
  // @ts-expect-error @types/compression assumes Express Request (with extended methods like .get()) but connect uses standard Node IncomingMessage. No biggie.
  if (options.compress) app.use(compression());
  if (options.cors) app.use(cors());


  if (options.jsprof) {
    app.use((req, res, next) => {
      res.setHeader("document-policy", "js-profiling");
      next();
    });
  }

  if (options.coi) {
    app.use((req, res, next) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      next();
    });
  }

  const csp = options.csp;
  if (csp) {
    app.use((req, res, next) => {
      res.setHeader("Content-Security-Policy", csp);
      next();
    });
  }

  app.use(serveStatic(options.root, options));

  return new Promise((resolve, reject) => {
    let port = Number(options.port);
    const maxPort = port + 100;

    function listen() {
      const server = app.listen(port, options.expose ? undefined : 'localhost');

      server.once('listening', () => {
        const address = server.address();
        const boundPort = address && typeof address === 'object' ? address.port : port;
        const url = `http://localhost:${boundPort}`;
        options.port = boundPort;
        options.open && openUrlInBrowser(url);
        resolve({app, server, options, url});
      });

      // If the port is already in use, try the next one up to maxPort.
      server.once('error', /** @type {(err: NodeJS.ErrnoException) => void} */  ((err) => {
        server.close();
        if (err.code === 'EADDRINUSE' && !isExplicit && port < maxPort) {
          port++;
          listen();
        } else {
          reject(err);
        }
      }));
    }

    listen();
  });
};


export default statikk;
