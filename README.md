# Statikk [![NPM statikk package](https://img.shields.io/npm/v/statikk.svg)](https://npmjs.org/package/statikk)

A simple and secure server for static files.

There are two smart security defaults set:

1. Your `.git` files are not exposed. (Whereas ALL other simple http servers do expose this security concern ([except `serve`](https://github.com/zeit/serve/issues/229)))
1. The server isn't accessible outside of `localhost`. Other folks on your network won't be able to browse it via your internal IP.

## Command line usage

```bash
$ yarn global add statikk
$ cd ~/Sites/fidgetspin.xyz
$ statikk
```

Then head to [http://localhost:8080/](http://localhost:8080/) to see the
contents of `./` served over HTTP.


### Command line options

* **hidden**: allow transfer of hidden files. Defaults to false
* **expose**: expose server to hosts other than `localhost`. Defaults to false
* **port**: custom port. Defaults to 8080

### Examples

```bash
// Start server at http://localhost:9000 serving ./
$ statikk --port 9000

// Start server at http://localhost:8080 serving ~/Sites/project
$ statikk --port 8080 ~/Sites/project
```

### History

This project is a fork of...

* https://github.com/boardman/statik which is a fork of
* https://github.com/johnkelly/statik which is a fork of
* https://github.com/hongymagic/statik (the OG `statik` on NPM) which hasn't been updated for 4 years.

The original project doesn't correct exclude all hidden files, which is why I've forked and republished.  ~paul irish. june 2017.
