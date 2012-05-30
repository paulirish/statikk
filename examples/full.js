//
// ## Complete demonstration.
//
// Here we customise just about everything: from root directory to caching
// controls.
//

var port = process.env.PORT || 3000;
var options = {

// Change which (root) folder to server over HTTP.

	root: 'public',

// What to serve as default if '/' is requested.

	defaults: ['index.html', 'cat.gif'],

// Should `static` keep an internal cache of things being served? Defaults to
// `true`. `static` will replace its internal cache if the file being cached
// is updated.

	cache: false,

// Predefine a set of HTTP headers to use for every request.

	headers: {
		'Cache-Control': 'no-cache',
		'Expires': (new Date()).toUTCString()
	},

// What to do incase of 500 or 404 (`static` doesn't support any other HTTP
// status codes).

	errors: {
		404: function (request, error) {},
		500: function (request, error) {}
	}

};

var static  = require('static');
var server  = static.createServer(options, function (request, response) {
	"use strict";

// Here we have access to request handler after `static` has processed it. Add
// additional headers, change the content, do whatever you think is necessary.
// Just remember, this function has the *last* say in the request -> response
// cycle, so if you override something.. Just don't fuck it up.

// The following snippet will override whatever `Content-Type` was set by
// `static`. Obviously not recommened, but it's a demo.

	response.header('Content-Type', 'text/x-static');

});

server.listen(port);
console.log("server online at http://localhost:%d/", port);
