# Statikk

A simple and secure server for static files.

There are two smart security defaults set:

1. Your `.git` files are not exposed. (Whereas ALL other simple http servers do expose this security concern)
1. The server isn't accessible outside of `localhost`. Other folks on your network won't be able to browse it via your internal IP.

## Command line usage

```bash
$ yarn global add statikk
$ cd ~/Sites/fidgetspin.xyz
$ statikk
```

Then head to [http://localhost:8080/](http://localhost:8080/) to see the
contents of `./` served over HTTP.


### Command line options

* **hidden**: allow transfer of hidden files. Defaults to false
* **expose**: expose server to hosts other than `localhost`. Defaults to false
* **port**: custom port. Defaults to 8080

### Examples

```bash
// Start server at http://localhost:9000 serving ./
$ statikk --port 9000

// Start server at http://localhost:8080 serving ~/Sites/project
$ statikk --port 8080 ~/Sites/project
```
