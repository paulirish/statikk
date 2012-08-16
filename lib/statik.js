/* vim: set noexpandtab ts=4 sw=4 ai si: */

var DEFAULT_PORT = 1203;

var debug = process.env.DEBUG_STATIC || process.env.STATIC_DEBUG ? function () { console.log.apply(console, arguments); } : function () {};
var http  = require('http');
var url   = require('url');
var path  = require('path');
var filed = require('filed');
var zlib  = require('zlib');

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
		var encoding = req.headers['accept-encoding'] || '';
		var compressions = encoding.split(',');
		var filepath  = url.parse(req.url).pathname;
		var extension = path.extname(filepath);

		if (extension.length === 0) {
			filepath = path.normalize(filepath += '/' + options.default);
		}

		filepath = path.resolve(options.root + '/' + filepath);
		filed(filepath).pipe(res);
	});
};

Server.prototype = {
	listen: function (port, callback) {
		port = port || (process.env.PORT || DEFAULT_PORT);
		this.server.listen(port);

		if (callback && typeof callback === 'function') {
			callback.call(this, port);
		}

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
