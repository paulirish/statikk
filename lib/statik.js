import connect from 'connect';
import compression from 'compression';
import cors from 'cors';
import serveStatic from 'serve-static';
import { spawn } from 'node:child_process';
import http from 'node:http';
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
 * @param {StatikkOpts} [opts]
 * @returns {Promise<StatikkResult>}
 */
function statikk(opts = {}) {
  const portStr = opts.port || process.env.PORT;
  const isExplicit = !!portStr;
  const explicitPort = portStr ? Number(portStr) : undefined;
  const options = { ...defaults, ...opts };
  const automagicPort = getPortNumberForPath(options.root);
  options.port = explicitPort || automagicPort;

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
    let currentPort = Number(options.port);
    const maxPort = currentPort + 100;

    function tryListen() {
      const server = http.createServer(app);

      server.once('listening', () => {
        const url = `http://localhost:${currentPort}`;
        options.port = currentPort;
        if (options.open) {
          spawn('open', [url], {stdio: 'inherit'});
        }
        resolve({app, server, options, url});
      });

      server.once('error', (err) => {
        server.removeAllListeners();
        server.close();

        const code = err && typeof err === 'object' && 'code' in err ? err.code : undefined;
        if (code === 'EADDRINUSE' && !isExplicit && currentPort < maxPort) {
          currentPort++;
          tryListen();
        } else {
          reject(err);
        }
      });

      if (options.expose) {
        server.listen(currentPort);
      } else {
        server.listen(currentPort, 'localhost');
      }
    }

    tryListen();
  });
};

export default statikk;
