#!/usr/bin/env node

//
// Fire up a standard `static` file server via command line
//

var path = require('path');
var opts = {
	"port": Number,
	"root": path,
	"quiet": Boolean,
	"help": Boolean
};
var nopt    = require('nopt');
var options = nopt(opts);

if (options.help) {
	console.log('Sorry, there is no help available at this stage');
} else {
	var static  = require('../index');
	var server  = static.createServer({
		root: options.root || 'public',
		quiet: options.quiet || false
	});

	server.listen(options.port || 3000);
}
