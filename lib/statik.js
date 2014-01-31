var path = require('path');
var extend = require('extend');
var connect = require('connect');
var modRewrite = require('connect-modrewrite');
var redirect = require('connect-redirection');

var defaults = {
  /* connect options */
  port: 5000,

  /* connect.static options */
  root: path.join(process.cwd(), 'public'),
  maxAge: 0,
  hidden: false,
  redirect: false,
  redirectSSL: 'https://google.com',

  /* other options */
  compress: true
};

module.exports = function (opts) {
  var port = opts.port || (process.env.PORT || defaults.port); 
  var options = extend(Object.create(null), defaults, opts);
  options.port = port;

  // setup middlewares
  var compress = connect.compress();
  var static = connect.static(path.resolve(options.root), options);

  // start the app on given port. defaults to 3000
  var app = connect();

  if (options.redirect) {
    app.use(redirect());
    app.use(function(req, res, next) {
      if(req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect([options.redirectSSL, req.url].join(''));
      } else {
        next();
      }
    });
  }
  
  app.use(modRewrite(['!\\.html|\\.js|\\.css|\\.jpeg|\\.svg|\\.gif|\\.ttf|\\.woff|\\.eot|\\.jpg|\\.png$ /index.html [L]']));

  app.use(compress);
  app.use(static);
  app.listen(options.port);

  return app;
};
