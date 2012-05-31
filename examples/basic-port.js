//
// ## Barebones demonstration.
//
// The following code will serve everything inside `./public` over HTTP using
// port 3000.
//

var static = require('../index');
var server = static.createServer();

server.listen(3000);
console.log("server online at http://localhost:3000/");
