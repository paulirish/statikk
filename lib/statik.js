/* vim: set noexpandtab ts=4 sw=4 ai si: */

var DEFAULT_PORT = 1203;

var debug = process.env.DEBUG_STATIC || process.env.STATIC_DEBUG ? function () { console.log.apply(console, arguments); } : function () {};
var http  = require('http');
var fs    = require('fs');
var path  = require('path');
var url   = require('url');
var mime  = require('mime');

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
			filepath  = options.default;
			extension = path.extname(filepath);
		}

		filepath = path.resolve(options.root + '/' + filepath);
		debug('Processing path: %s', filepath);

		path.exists(filepath, function (exists) {
			if (!exists) {
				// 404
				res.writeHead(404);
				res.end();
			}

			fs.readFile(filepath, function (error, content) {
				if (error) {
					res.writeHead(500);
					res.end();
				}

				var type = mime.lookup(extension.slice(extension.lastIndexOf('.') + 1));
				res.writeHead(200, {
					'Content-Type': type
				});
				res.end(content, 'utf-8');
			});
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
