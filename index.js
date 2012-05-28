var http = require('http');
var fs   = require('fs');
var path = require('path');
var url  = require('url');
var mime = require('mime');
var port = process.env.PORT || 9292;
var root = './public';

http.createServer(function (request, response) {

	var filepath  = url.parse(request.url).pathname;
	if (filepath == '/') {
		filepath = '/index.html';
	}
	filepath = root + filepath;

	path.exists(filepath, function (exists) {
		if (exists) {
			fs.readFile(filepath, function (error, content) {
				if (error) {
					console.error('Oops, there was an error on our part', request.url, filepath);

					response.writeHead(500);
					response.end();
				} else {
					var extension = path.extname(filepath);
					var mimeType  = mime.lookup(extension.slice(extension.lastIndexOf('.') + 1));
					var expires = new Date();
					expires.setHours(expires.getHours() + 1 % 24);

					response.writeHead(200, {
						'Cache-Control': 'no-cache',
						//'Cache-Control': 'max-age=600, must-revalidate',
						'Content-Type': mimeType,
						'Expires': expires.toGMTString()
					});

					response.end(content, 'utf-8');
				}
			});
		} else {
			console.error("You asked for something we don't have: ", request.url, filepath);

			response.writeHead(404);
			response.end();
		}
	});

}).listen(port);

console.log('Server running on port:' + port + '/');
