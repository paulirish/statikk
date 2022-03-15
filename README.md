# Statikk [![NPM statikk package](https://img.shields.io/npm/v/statikk.svg)](https://npmjs.org/package/statikk)

A simple and secure server for static files.

There are two smart security defaults set:

1. Your `.git` files are not exposed. (Whereas ALL other simple http servers do expose this security concern ([except `serve`](https://github.com/zeit/serve/issues/229)))
1. The server isn't accessible outside of `localhost`. Other folks on your network won't be able to browse it via your internal IP.

Also, if you don't specify a port it'll be deterministically generated based on your working directory. :tada:

## Command line usage

```bash
$ npm install -g statikk
$ cd ~/Sites/fidgetspin.xyz
$ statikk
```

Then head to `http://localhost:XXXXX/` to see the contents of `./` served over HTTP.

### Command line options

* **hidden**: allow transfer of hidden files. 
* **expose**: expose server to hosts other than `localhost`.
* **port**: custom port. If not specified, it'll use a port *automagically* based on `process.cwd()`. (So different projects use different ports!)
* **open**: Open the hosted URL in your default browser. (Only supported on Mac OS!)
* **cors**: Add [CORS](https://web.dev/cross-origin-resource-sharing/) headers
* **coi**: Add [cross-origin isolation](https://web.dev/cross-origin-isolation-guide/) headers ([more](https://web.dev/coop-coep/))

All non-port options default to `false`.

### Examples

```bash
// Start server at http://localhost:9000 serving ./
$ statikk --port 9000

// Start server at http://localhost:60384 (perhaps) serving ~/Sites/project
$ statikk ~/Sites/project

// Start server at a deterministically-chosen port based on the working directory, and open the browser
$ statikk --open
```

### History

This project is a fork of...

* https://github.com/boardman/statik which is a fork of
* https://github.com/johnkelly/statik which is a fork of
* https://github.com/hongymagic/statik (the OG `statik` on NPM) which hasn't been updated for 4 years.

The original project doesn't correctly exclude all hidden files, which is why I've forked and republished.  ~paul irish. june 2017.
