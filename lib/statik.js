var path = require('path');
var extend = require('extend');
var connect = require('connect');
var modRewrite = require('connect-modrewrite');
var redirect = require('connect-redirection');

var defaults = {
  /* connect options */
  port: 3000,

  /* connect.static options */
  root: path.join(process.cwd(), 'public'),
  maxAge: 0,
  hidden: false,
  redirect: true,

  /* other options */
  compress: true
};

module.exports = function (opts) {
  var options = extend(Object.create(null), defaults, opts);

  // setup middlewares
  var compress = connect.compress();
  var static = connect.static(options.root, options);

  // start the app on given port. defaults to 3000
  var app = connect();

  app.use(redirect());
  app.use(function(req, res, next) {
    if(req.headers['x-forwarded-proto']!='https') {
      return res.redirect(['https://app.releaseboard.com', req.url].join(''));
    } else {
      next();
    }
  });

  app.use(modRewrite(['!\\.html|\\.js|\\.css|\\.png$ /index.html [L]']));

  app.use(compress);
  app.use(static);
  app.listen(options.port);

  return app;
};
