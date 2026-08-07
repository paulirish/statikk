# Statikk [![NPM statikk package](https://img.shields.io/npm/v/statikk.svg)](https://npmjs.org/package/statikk)

A simple and secure server for static files.

* Pithy flags for CORS and Cross-origin isolation.
* Two smart security defaults:
   1. Your `.git` files are not exposed. (Whereas ALL other simple http servers do expose this security concern ([except `serve`](https://github.com/zeit/serve/issues/229)))
   1. The server isn't accessible outside of `localhost`. Other folks on your network won't be able to browse it via your internal IP.
* If you don't specify a port, it'll be deterministically generated based on your working directory. :tada:

## Command line usage

```sh
$ npm install -g statikk

$ cd ~/Sites/fidgetspin.xyz

$ statikk --cors --open
 🤓 http://localhost:10810  statikk serving locally: ~/Sites/fidgetspin.xyz
```

### Command line options

* **`--port NNNN`**: custom port. If not specified, it'll use a port *automagically* based on `process.cwd()`. (So different projects use different ports!)
* **`--open`**: Open the hosted URL in your default browser. (Only supported on Mac OS!)
* **`--cors`**: Add [CORS](https://web.dev/cross-origin-resource-sharing/) headers
* **`--coi`**: Add [cross-origin isolation](https://web.dev/cross-origin-isolation-guide/) headers ([more](https://web.dev/coop-coep/))
* **`--jsprof`**: Add `document-policy: js-profiling` header (for js self-profiling api)
* **`--csp VAL`**: Add a [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) header with value `VAL`

This weakens security:
* **`--expose`**: expose server to hosts other than `localhost`.

All non-port options default to `false` (except `--csp` which is undefined by default).

### Examples

```bash
// Start server at http://localhost:9000 serving ./
$ statikk --port 9000

// Start server at http://localhost:60384 (perhaps) serving ~/Sites/project
$ statikk ~/Sites/project

// Start server at a deterministically-chosen port based on the working directory, and open the browser
$ statikk --open
```
## Programmatic ESM usage

```js
import statikk from 'statikk';

const { app, server, options, url } = await statikk({
  root: './public', // Defaults to process.cwd()
  port: 3000,       // Defaults to a deterministic port based on root
  cors: true,
  coi: true,
  csp: "default-src 'self'",
  open: true,       // Open browser on macOS
});

// To stop the server:
// server.close();
```

### Options

`statikk` accepts an options object:

* **`root`**: The directory to serve. Defaults to `process.cwd()`.
* **`port`**: The port to listen on. If not specified or `0`, it will use a port based on `root`.
* **`cors`**: Boolean, add CORS headers. Defaults to `false`.
* **`coi`**: Boolean, add Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers. Defaults to `false`.
* **`jsprof`**: Boolean, add `document-policy: js-profiling` header. Defaults to `false`.
* **`csp`**: String, value for `Content-Security-Policy` header. Defaults to `undefined`.
* **`open`**: Boolean, open browser on server start (only supported on macOS). Defaults to `false`.
* **`compress`**: Boolean, enable gzip compression. Defaults to `true`.
* **`expose`**: Boolean, allow access from other hosts on the network (listens on `0.0.0.0` instead of `localhost`). Defaults to `false`.

Additionally, any options accepted by [serve-static](https://github.com/expressjs/serve-static) can be passed, such as `maxAge`, `dotfiles`, etc.

### History

This project is a fork of...

* https://github.com/boardman/statik which is a fork of
* https://github.com/johnkelly/statik which is a fork of
* https://github.com/hongymagic/statik (the OG `statik` on NPM), but unmaintained since 2013.

The original project doesn't correctly exclude all hidden files, which is why I've forked and republished.  ~paul irish. june 2017.
