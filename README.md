# Statik

A simple and easy-to-use Node.js module to server static files over HTTP. It's
super simple to use it.

## Command line usage

```bash
$ npm install -g statik
$ cd ~/Sites
$ statik
```

### Customise the default directory and port

```bash
$ statik --root ./mocks --port 3000
```

## npm

```javascript
// package.json
// ...
dependencies: {
	"statik": ">= 1.1.0"
}
```

## Usage

```javascript
// app.js
var statik = require('statik');
var server = statik.createServer();
server.listen(3000);
```

Your server will be running on `http://localhost:3000` serving `./public` directory.

## Customisations

You can specify the directory you wish to serve as an argument.

```javascript
// app.js
var statik = require('statik');
var server = statik.createServer('/Users/hongymagic/Sites');
server.listen();
```

Your server will be running on `http://localhost:1203` server `/Users/hongymagic/sites` directory.

## FAQ

### What about the HTTP Headers?

> There are some default HTTP Headers that I am going to introduce for the reaons
why I have create this package in the first place:

> 1. Content-Type: statik uses another internal Node.js package `mime` to check
against content types
> 2. Cache-Control: 'no-cache'. The primary purpose of statik was so I could easily
run a folder as web server over HTTP while I'm working on a new site. Might as
well kill off the cache while I'm writing and debugging CSS and JavaScript. There
will be an option to disable to default behaviour though.


### Why default to port 1203?

> It's all personal.

### How does statik treat root `/`?

> For now, it will translate that into `index.html`
## TODO

1. Clean up code around 404 and 500 errors
2. Options to add/remove default HTTP headers
3. Default set of files instead of `index.html`
