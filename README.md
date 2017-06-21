# Statikk

A simple and easy-to-use Node.js module to server static files over HTTP. It's
super simple to use it.

Most notably, your `.git` files are not exposed. (Whereas ALL other simple http servers do expose this security concern)

## Command line usage

```bash
$ yarn global add statikk
$ cd ~/Sites/fidgetspin.xyz
$ statikk
```

Then head to [http://localhost:8080/](http://localhost:8080/) to see the
contents of `./` served over HTTP.

### Customise the default directory and port

```bash
// Start server at http://localhost:9000 serving ./
$ statikk --port 9000

// Start server at http://localhost:8080 serving ~/Sites/project
$ statikk --port 8080 ~/Sites/project
```

### Other command line options

* **maxAge**: browser cache maxAge in milliseconds. Defaults to 0
* **hidden**: allow transfer of hidden files. Defaults to false
* **redirect**: redirect to trailing "/" when pathname is directory. Defaults to true
* **compress**: enable gzip compression. Defaults to true

