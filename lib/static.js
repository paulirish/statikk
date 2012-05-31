// Copyright David G. Hong.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var DEFAULT_PORT = 1203;

var debug = process.env.DEBUG_STATIC || process.env.STATIC_DEBUG
            ? function () { console.log.apply(console, arguments) }
            : function () {};
var http  = require('http');
var fs    = require('fs');
var path  = require('path');
var url   = require('url');
var mime  = require('mime');

function Server (root, requestHandler) {
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
			filepath = options.default;
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
}

Server.prototype = {
	listen: function (port) {
		port = port || DEFAULT_PORT;
		this.server.listen(port);
		debug('Server online at http://localhost:%d', port);
	}
};

exports.Server = Server;
exports.createServer = function (path, requestHandler) {
	return new Server(path, requestHandler);
};
