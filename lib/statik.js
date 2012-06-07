/* vim: set noexpandtab ts=4 sw=4 ai si: */

var DEFAULT_PORT = 1203;

var debug = process.env.DEBUG_STATIC || process.env.STATIC_DEBUG ? function () { console.log.apply(console, arguments); } : function () {};
var http  = require('http');
var path  = require('path');
var url   = require('url');
var mime  = require('mime');
var Q     = require('q');
var fs    = require('q-fs');

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
		var filepath  = url.parse(req.url).pathname;
		var extension = path.extname(filepath);

		if (extension.length === 0) {
			filepath = path.normalize(filepath += '/' + options.default);
			extension = path.extname(filepath);
		}

		filepath = path.resolve(options.root + '/' + filepath);

		Q.when(fs.exists(filepath), function (exists) {
			debug('%d: %s', exists ? 200 : 404, filepath);

			if (exists) {
				Q.when(fs.read(filepath), function (content) {
					var type = mime.lookup(extension.slice(extension.lastIndexOf('.') + 1));
					debug(type);

					res.writeHead(200, { 'Content-Type': type });
					res.end(content, 'utf-8');
				}, function (error) {
					res.writeHead(500);
					res.end();
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
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
