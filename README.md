# Statik

A simple and easy-to-use Node.js module to server static files over HTTP. It's
super simple to use it.

## Command line usage

```bash
$ npm install -g statik
$ cd ~/Sites
$ statik
```

Then head to [http://localhost:3000/](http://localhost:3000/) to see the
contents of `./public` served over HTTP.

### Customise the default directory and port

```bash
// Start server at http://localhost:3000 serving ./public
$ static --port 3000

// Start server at http://localhost:3000 serving ~/Sites/project
$ statik --port 3000 ~/Sites/project
```

### Other command line options

**maxAge**: browser cache maxAge in milliseconds. Defaults to 0
**hidden**: allow transfer of hidden files. Defaults to false
**redirect**: redirect to trailing "/" when pathname is directory. Defaults to true
**compress**: enable gzip compression. Defaults to true

## Use it programmatically

```bash
$ npm install statik --save
```

### Usage

```javascript
// app.js
var statik = require('statik');
statik(3000);
```

Your server will be running on [http://localhost:3000/](http://localhost:3000/)
serving `./public` directory.

### Customisations

You can specify the directory you wish to serve as an argument.

```javascript
// app.js
var statik = require('statik');
statik({
	port: 3000,
	root: '/Users/hongymagic/Sites'
});
```

Your server will be running on [http://localhost:3000/](http://localhost:3000/)
server `/Users/hongymagic/sites` directory.

You can also use command line options when invoking `statik` function.

## Running it on heroku

```bash
$ echo 'web: node app.js' > Procfile
$ heroku create --stack cedar statik-app
$ git push heroku master
$ heroku open
```

BAM!

## FAQ

### Why?

> Because I hate `file://` protocol for the reasons I wish not to disclose. One
of the recent ones I've come across is [Typekit](http://help.typekit.com/customer/portal/articles/6857-using-typekit-while-developing-locally).
And trust me there are other problems that pop-up if you're primarily working
for the `http://` protocol.

### What about the HTTP Headers?

> There are some default HTTP Headers that I am going to introduce for the reaons
why I have create this package in the first place:

> 1. Content-Type: statik uses another internal Node.js package `mime` to check
against content types
> 2. Cache-Control: 'no-cache'. The primary purpose of statik was so I could easily
run a folder as web server over HTTP while I'm working on a new site. Might as
well kill off the cache while I'm writing and debugging CSS and JavaScript. There
will be an option to disable to default behaviour though.

### How does statik treat root `/`?

> For now, it will translate that into `index.html`

## TODO

1. Clean up code around 404 and 500 errors
2. Options to add/remove default HTTP headers
3. Default set of files instead of `index.html`
