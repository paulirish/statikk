/* vim: set noexpandtab ts=4 sw=4 ai si: */

var DEFAULT_PORT = 1203;

var debug = process.env.DEBUG_STATIC || process.env.STATIC_DEBUG ? function () { console.log.apply(console, arguments); } : function () {};
var http  = require('http');
var filed = require('filed');

var Server = function (root, requestHandler) {
	if (!(this instanceof Server)) {
		return new Server(options);
	}

	/* Parse options */
	var options      = Object.create(null);
	options.root     = root || './public';
	options.default  = 'index.html';

	this.options     = options;

	/* Setup HTTP server */
	this.server = http.createServer(function (req, res) {
		req.pipe(filed(options.root)).pipe(res);
	});
};

Server.prototype = {
	listen: function (port) {
		port = port || (process.env.PORT || DEFAULT_PORT);
		this.server.listen(port);
		debug('Server online at http://localhost:%d', port);

		return this;
	},

	close: function () {
		this.server.close();
	}
};

exports.Server = Server;
exports.createServer = function (path, requestHandler) {
	return new Server(path, requestHandler);
};
