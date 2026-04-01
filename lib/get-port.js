import { homedir } from 'node:os';
const home = homedir();
const MAXPORT = 65353;
const MINPORT = 1024;

const BLOCKED_PORTS = new Set([
  2049, // NFS
  3659, // Apple-SASL
  4045, // Lockd
  6000, // X11
  6665, 6666, 6667, 6668, 6669 // IRC
]);

/**
 * Deterministically turn a filesystem path into a port number (1024 .. 65353)
 * Not perfect, and conflicts are possible, but probably rare! :p
 * Thx https://www.npmjs.com/package/port-number for the inspiration
 *
 * @param {string} path
 * @returns {number}
 */
function getPortNumberForPath(path) {
  const relativePath = path.replace(`${home}/`, '');
  let hash = charCodeHash(relativePath);

  hash = parseInt(`${hash}`.split('').reverse().join('')); // reverse so the leading digit has more entropy
  let port = Math.max(hash + 1024, MINPORT); // clamp within usable range

  // Make it a slightly more aesthetically pleasing
  if (port * 10 < MAXPORT) port *= 10;

  port = Math.round(port);

  while (BLOCKED_PORTS.has(port)) {
    port++;
    if (port > MAXPORT) port = MINPORT;
  }

  return port;
}

/**
 * charCode sum of all characters in the string
 *
 * @param {string} str
 * @returns {number}
 */
function charCodeHash(str) {
  let sum = 0;
  for (let codePoint of str) {  // We fancy. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
    sum += ((codePoint.codePointAt(0) ?? 0) - 30); // subtract 30 cuz we want a smaller number and the first ~30 are control characters
  }
  return sum;
}

export {
  getPortNumberForPath,
  charCodeHash,
};
