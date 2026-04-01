import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import statik from '../lib/statik.js';

function createTempDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'statikk-test-'));
  return tmpDir;
}

test('statikk - serving files', async (t) => {
  await t.test('should serve an existing file', async () => {
    const tmpDir = createTempDir();
    const filePath = path.join(tmpDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello World');

    const { server, url } = await statik({ root: tmpDir });

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
    const { server, url } = await statik({ root: tmpDir });

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

    const { server, url } = await statik({ root: tmpDir });

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

    const { server, url } = await statik({ root: tmpDir, cors: true });

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

    const { server, url } = await statik({ root: tmpDir, coi: true });

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

    const { server, url } = await statik({ root: tmpDir, jsprof: true });

    try {
      const res = await fetch(`${url}/hello.txt`);
      assert.strictEqual(res.headers.get('document-policy'), 'js-profiling');
    } finally {
      server.close();
      fs.unlinkSync(filePath);
      fs.rmdirSync(tmpDir);
    }
  });
});
