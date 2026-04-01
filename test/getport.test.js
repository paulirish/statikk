import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { getPortNumberForPath, djb2Hash, RANGE } from '../lib/get-port.js';

test('getPortNumberForPath - determinism', () => {
  const path1 = '/Users/test/project';
  const path2 = '/Users/test/project';

  const port1 = getPortNumberForPath(path1);
  const port2 = getPortNumberForPath(path2);

  assert.strictEqual(port1, port2, 'Same path should yield same port');
});

test('getPortNumberForPath - different paths yield different ports', () => {
  const path1 = '/Users/test/project1';
  const path2 = '/Users/test/project2';

  const port1 = getPortNumberForPath(path1);
  const port2 = getPortNumberForPath(path2);

  assert.notStrictEqual(port1, port2, 'Different paths should yield different ports');
});

test('getPortNumberForPath - medium zero (multiple of 100)', () => {
  const paths = [
    '/Users/test/project1',
    '/Users/test/project2',
    '/Users/test/another/long/path/with/more/segments',
    'relative/path'
  ];

  for (const path of paths) {
    const port = getPortNumberForPath(path);
    assert.strictEqual(port % 100, 0, `Port ${port} for ${path} should be a multiple of 100`);
  }
});

test('getPortNumberForPath - range constraint', () => {
  const paths = [
    '/a', '/b', '/c', '/d', '/e'
  ];

  for (const path of paths) {
    const port = getPortNumberForPath(path);
    assert.ok(port >= 1100, `Port ${port} should be >= 1100`);
    assert.ok(port <= 65300, `Port ${port} should be <= 65300`);
  }
});

test('getPortNumberForPath - skip hard zeros under 10000', () => {
  const badPorts = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];

  for (let i = 0; i < 100; i++) {
    const path = `random-path-${i}`;
    const port = getPortNumberForPath(path);

    assert.ok(!badPorts.includes(port), `Port ${port} for ${path} should not be a hard zero under 10k`);
  }
});

test('djb2Hash - consistency and unsigned 32-bit', () => {
  const hash1 = djb2Hash('test');
  const hash2 = djb2Hash('test');

  assert.strictEqual(hash1, hash2);
  assert.ok(hash1 >= 0);
  assert.ok(hash1 <= 0xFFFFFFFF);
});

test('getPortNumberForPath - real-world and collision rate check', () => {
  const codeDir = path.join(homedir(), 'code');
  if (!fs.existsSync(codeDir)) {
    return;
  }

  const entries = fs.readdirSync(codeDir, { withFileTypes: true });
  const dirs = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  const seenPorts = new Map(); // Map port to folder name for better error messages
  let collisionCount = 0;

  for (const dir of dirs) {
    const fullPath = path.join(codeDir, dir);
    const port = getPortNumberForPath(fullPath);

    if (seenPorts.has(port)) {
      collisionCount++;
      // console.error(`Collision detected on port ${port}: '${dir}' collided with '${seenPorts.get(port)}'`);
    }
    seenPorts.set(port, dir);
  }

  // Statistical Collision Analysis (Birthday Paradox)
  const N = dirs.length;
  if (N > 1) {
    const expectedCollisions = (N * (N - 1)) / (2 * RANGE);
    const stdDev = Math.sqrt(expectedCollisions);
    const allowedMax = expectedCollisions + (3 * stdDev);

    /** @param {number} num */
    const pad = (num) => num.toFixed(1).padStart(6);

    const output = [
      `--- Collision Analysis ---`,
      `${pad(N)} <- Projects`,
      `${pad(collisionCount)} <- Collisions`,
      `${pad(expectedCollisions)} <- Expected`,
    ].join('\n');

    console.log(output);

    assert.ok(
      collisionCount <= allowedMax,
      `Unusually high collision rate: ${collisionCount} collisions for ${N} projects. Expected ~${expectedCollisions.toFixed(1)}.`
    );
  }
});
