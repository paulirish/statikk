import { homedir } from 'node:os';
const home = homedir();
const MAXPORT = 65300;
const MINPORT = 1100;
const RANGE = (MAXPORT - MINPORT) / 100 + 1;

/**
 * Deterministically turn a filesystem path into a port number in the valid range (1024 .. 65353)
 * Maps to a multiple of 100, because they're more memorable (but we skip 1000-multiples under 10k, because too many tools use them).
 *
 * @param {string} path
 * @returns {number}
 */
function getPortNumberForPath(path) {
  const hash = djb2Hash(path.replace(`${home}/`, ''));
  let port = MINPORT + (hash % RANGE) * 100;

  while (port < 10000 && port % 1000 === 0) {
    port = port >= MAXPORT ? MINPORT : port + 100;
  }
  return port;
}



/**
 * djb2 hash function - simple, fast, and good distribution for strings.
 * Thx http://www.cse.yorku.ca/~oz/hash.html
 *
 * @param {string} str
 * @returns {number} Unsigned 32-bit integer
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

export {
  getPortNumberForPath,
  djb2Hash,
  RANGE,
};

