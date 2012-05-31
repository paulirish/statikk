//
// ## Barebones demonstration.
//
// The following code will serve everything inside `./public` over HTTP using
// port 1203 (default).
//

var static = require('../index');
var server = static.createServer();

server.listen();
console.log("server online at http://localhost:1203/");
