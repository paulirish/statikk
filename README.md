# Static

A simple and easy-to-use Node.js module to server static files over HTTP. It's
super simple to use it.

## npm

*Submission to NPM repository pending*

```javascript
// package.json
// ...
dependencies: {
	"static": ">= 0.0.1"
}
```

## Usage

```javascript
// app.js
var static = require('static');
var server = static.createServer();
server.listen(3000);
```

Your server will be running on `http://localhost:3000` serving `./public` directory.

## Customisations

You can specify the directory you wish to serve as an argument.

```javascript
// app.js
var static = require('static');
var server = static.createServer('/Users/hongymagic/Sites');
server.listen();
```

Your server will be running on `http://localhost:1203` server `/Users/hongy/magic/sites` directory.

## What about the HTTP Headers?

There are some default HTTP Headers that I am going to introduce for the reaons
why I have create this package in the first place:

1. Content-Type: static uses another internal Node.js package `mime` to check
against content types
2. Cache-Control: 'no-cache'. The primary purpose of static was so I could easily
run a folder as web server over HTTP while I'm working on a new site. Might as
well kill off the cache while I'm writing and debugging CSS and JavaScript. There
will be an option to disable to default behaviour though.

## FAQ

### Why default to port 1203?

> It's all personal.
