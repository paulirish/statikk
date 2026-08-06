import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import statikk from '../lib/statik.js';

function createTempDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'statikk-test-'));
  return tmpDir;
}

test('statikk - serving files', async (t) => {
  await t.test('should serve an existing file', async () => {
    const tmpDir = createTempDir();
    const filePath = path.join(tmpDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello World');

    const { server, url } = await statikk({ root: tmpDir });

    try {
      const res = await fetch(`${url}/hello.txt`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(await res.text(), 'Hello World');
    } finally {
      server.close();
      fs.unlinkSync(filePath);
      fs.rmdirSync(tmpDir);
    }
  });

  await t.test('should return 404 for non-existent file', async () => {
    const tmpDir = createTempDir();
    const { server, url } = await statikk({ root: tmpDir });

    try {
      const res = await fetch(`${url}/not-found.txt`);
      assert.strictEqual(res.status, 404);
    } finally {
      server.close();
      fs.rmdirSync(tmpDir);
    }
  });

  await t.test('should serve index.html by default if it exists', async () => {
    const tmpDir = createTempDir();
    const indexPath = path.join(tmpDir, 'index.html');
    fs.writeFileSync(indexPath, '<h1>Index</h1>');

    const { server, url } = await statikk({ root: tmpDir });

    try {
      const res = await fetch(`${url}/`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(await res.text(), '<h1>Index</h1>');
    } finally {
      server.close();
      fs.unlinkSync(indexPath);
      fs.rmdirSync(tmpDir);
    }
  });
});

test('statikk - options', async (t) => {
  await t.test('should add CORS headers when enabled', async () => {
    const tmpDir = createTempDir();
    const filePath = path.join(tmpDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello World');

    const { server, url } = await statikk({ root: tmpDir, cors: true });

    try {
      const res = await fetch(`${url}/hello.txt`);
      assert.strictEqual(res.headers.get('access-control-allow-origin'), '*');
    } finally {
      server.close();
      fs.unlinkSync(filePath);
      fs.rmdirSync(tmpDir);
    }
  });

  await t.test('should add COI headers when enabled', async () => {
    const tmpDir = createTempDir();
    const filePath = path.join(tmpDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello World');

    const { server, url } = await statikk({ root: tmpDir, coi: true });

    try {
      const res = await fetch(`${url}/hello.txt`);
      assert.strictEqual(res.headers.get('cross-origin-embedder-policy'), 'require-corp');
      assert.strictEqual(res.headers.get('cross-origin-opener-policy'), 'same-origin');
    } finally {
      server.close();
      fs.unlinkSync(filePath);
      fs.rmdirSync(tmpDir);
    }
  });

  await t.test('should add js-profiling header when jsprof enabled', async () => {
    const tmpDir = createTempDir();
    const filePath = path.join(tmpDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello World');

    const { server, url } = await statikk({ root: tmpDir, jsprof: true });

    try {
      const res = await fetch(`${url}/hello.txt`);
      assert.strictEqual(res.headers.get('document-policy'), 'js-profiling');
    } finally {
      server.close();
      fs.unlinkSync(filePath);
      fs.rmdirSync(tmpDir);
    }
  });

  await t.test('should add CSP header when csp enabled', async () => {
    const tmpDir = createTempDir();
    const filePath = path.join(tmpDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello World');

    const { server, url } = await statikk({ root: tmpDir, csp: "require-trusted-types-for 'script'; trusted-types 'none';" });

    try {
      const res = await fetch(`${url}/hello.txt`);
      assert.strictEqual(res.headers.get('content-security-policy'), "require-trusted-types-for 'script'; trusted-types 'none';");
    } finally {
      server.close();
      fs.unlinkSync(filePath);
      fs.rmdirSync(tmpDir);
    }
  });
});

test('statikk - port collision handling', async (t) => {
  await t.test('should fail if explicit port is already in use', async () => {
    const tmpDir1 = createTempDir();
    const tmpDir2 = createTempDir();

    // Start first server on explicit port 8888
    const { server: server1 } = await statikk({ root: tmpDir1, port: 8888 });

    try {
      // Attempting to start second server on same explicit port 8888 should reject
      await assert.rejects(
        statikk({ root: tmpDir2, port: 8888 }),
        (/** @type {any} */ err) => {
          assert.strictEqual(err.code, 'EADDRINUSE');
          return true;
        }
      );
    } finally {
      server1.close();
      fs.rmdirSync(tmpDir1);
      fs.rmdirSync(tmpDir2);
    }
  });

  await t.test('should increment port if automagic port is already in use', async () => {
    const tmpDir = createTempDir();

    // Start first server (calculates and binds to automagic port)
    const { server: server1, options: options1 } = await statikk({ root: tmpDir });
    const basePort = options1.port;
    if (typeof basePort !== 'number') {
      throw new Error('Expected basePort to be a number');
    }

    // Start second server serving the same directory (same automagic port)
    const { server: server2, options: options2 } = await statikk({ root: tmpDir });

    try {
      assert.strictEqual(options2.port, basePort + 1);
    } finally {
      server1.close();
      server2.close();
      fs.rmdirSync(tmpDir);
    }
  });

  await t.test('should support port 0 to bind to a random free port', async () => {
    const tmpDir = createTempDir();
    const { server, options } = await statikk({ root: tmpDir, port: 0 });

    try {
      assert.ok(typeof options.port === 'number');
      assert.ok(options.port > 0);
    } finally {
      server.close();
      fs.rmdirSync(tmpDir);
    }
  });
});
