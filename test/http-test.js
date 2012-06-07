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
	.describe('statik.createServer($port)')
	.addBatch({
		'new statik server instance': {
			topic: server,

			'must be of Server instance': function (server) {
				assert.ok(server instanceof statik.Server);
			},
		}
	})
	.export(module);
