/* vim: set noexpandtab ts=4 sw=4 ai si: */

var vows   = require('vows');
var assert = require('assert');
var http   = require('http');
var statik = require('../index');

/* SET UP */
var root   = '.';
var port   = 3000;
var server = statik.createServer(root);
server.listen(port);

/* Simple test to get me over the line... */
vows
	.describe('Singly linked Node')
	.addBatch({
		'new statik server instance': {
			topic: server,

			'must be of Server instance': function (server) {
				assert.ok(server instanceof statik.Server);
			},
		},

		'package.json': {
			topic: function () {
				http.get({
					"host": "localhost",
					"port": port,
					"path": "/package.json"
				}, this.callback);
			},

			'server returns HTTP 200 OK': function (res, error) {
				assert.equal(res.statusCode, 200);
			}
		}
	})
	.export(module);
