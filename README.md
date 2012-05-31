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

## FAQ

### Why default to port 1203?

> It's all personal.
