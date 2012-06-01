//
// ## Barebones demonstration.
//
// The following code will serve everything inside `./public` over HTTP using
// port 1203 (default).
//

var statik = require('../index');
var server = statik.createServer();

server.listen();
console.log("server online at http://localhost:1203/");
