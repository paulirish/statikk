var path = require('path');
var extend = require('extend');
var connect = require('connect');
var compression = require('compression');
var serveStatic = require('serve-static');
const { spawn } = require('child_process');


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
};

// Deterministically turn a filesystem path into a port number (1024 .. 65353)
// Not perfect, and conflicts are possible, but probably rare! :p
function getPortNumberForPath(path) {
  // For filesystem paths (typically prefixed with /Users/username/…), I generally see numbers from 100_000_000 to 2_100_000_00 (negative AND positive)
  const thirtytwobithash = hash(path);
  // Number.MAX_SAFE_INTEGER seems way too high.
  // I hashed all the paths i normally use and the highest hash value I saw was 2_140_869_291
  // So I'll pretend like the highest reasonable is 10 billion.. eh.
  const rescaled = Math.abs(thirtytwobithash) / 10_000_000_000;
  // Less conflicts at the top of port numbers, and most hashes are small numbers, so... yeah.
  const decentPort = Math.floor(rescaled * (65353 - 1024)) + 1024;


  // https://docs.google.com/spreadsheets/d/1jGovQNORBT5ebqLaDAEGktyWp5VUsDDBu6PH9KnryVI/edit#gid=0
  // I need two digits of it (from the rando part) and i'll add 1050 to keep it save
  const digits = Array.from(Math.abs(thirtytwobithash).toString().padStart(5, '0'));
  let aestheticPort = parseInt([digits[1], 0, digits[2], 0].join(''), 10);
  aestheticPort += 1050;
  return aestheticPort;
}

module.exports = function (opts) {
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

  var static = serveStatic(options.root, options);
  app.use(static);

  var server = app.listen(options.port, options.expose ? undefined : 'localhost');
  console.log(`🤓 Served by statikk: ${url}`);
  return {app, server, port: options.port, url};
};

// turns a string into a 32-bit integer. from the comments in https://stackoverflow.com/q/7616461/89484
function hash(str) {
  return [].reduce.call(str, (hash, i) => {
      var chr = i.charCodeAt(0);
      hash = (hash << 5) - hash + chr;
      return hash | 0;
    },0);
}

module.exports.getPortNumberForPath = getPortNumberForPath;
module.exports.hash = hash;