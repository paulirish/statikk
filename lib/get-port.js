const homedir = require('os').homedir();
const MAXPORT = 65353;
const MINPORT = 1024;

// Deterministically turn a filesystem path into a port number (1024 .. 65353)
// Not perfect, and conflicts are possible, but probably rare! :p
// Thx https://www.npmjs.com/package/port-number for the inspiration
function getPortNumberForPath(path) {
  const relativePath = path.replace(`${homedir}/`, '');
  let hash = charCodeHash(relativePath);

  hash = parseInt(`${hash}`.split('').reverse().join('')); // reverse so the leading digit has more entropy
  let port = Math.max(hash + 1024, MINPORT); // clamp within usable range

  // Make it a slightly more aesthetically pleasing
  if (port * 10 < MAXPORT) port *= 10;
  
  return Math.round(port);
}

// charCode sum of all characters in the string
function charCodeHash(str) {
  let sum = 0;
  for (let codePoint of str) {  // We fancy. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
    sum += (codePoint.codePointAt(0) - 30); // subtract 30 cuz we want a smaller number and the first ~30 are control characters
  }
  return sum;
}

module.exports = {
  getPortNumberForPath, 
  charCodeHash,
};
