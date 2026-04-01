const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

function createTempDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'statikk-test-cli-'));
  return tmpDir;
}

function runCliExiting(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, '../bin/statikk'), ...args]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());

    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.on('error', reject);
  });
}

function startCliServing(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, '../bin/statikk'), ...args]);
    let stdout = '';
    let stderr = '';
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        child.kill();
        reject(new Error('Timeout waiting for server to start. Output: ' + stdout));
      }
    }, 5000);

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      
      // Look for the URL in the output
      const match = stdout.match(/(http:\/\/localhost:\d+)/);
      if (match && !resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ child, url: match[1], stdout, stderr });
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(err);
      }
    });

    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(new Error(`Server exited early with code ${code}. Output: ${stdout}\nStderr: ${stderr}`));
      }
    });
  });
}

test('CLI - help', async () => {
  const { code, stdout } = await runCliExiting(['--help']);
  assert.strictEqual(code, 0);
  assert.match(stdout, /Usage:/);
});

test('CLI - serving a directory', async (t) => {
  const tmpDir = createTempDir();
  const filePath = path.join(tmpDir, 'hello.txt');
  fs.writeFileSync(filePath, 'Hello from CLI');

  const { child, url } = await startCliServing([tmpDir]);

  try {
    const res = await fetch(`${url}/hello.txt`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(await res.text(), 'Hello from CLI');
  } finally {
    child.kill();
    // Allow process to terminate
    await new Promise(r => setTimeout(r, 100));
    fs.unlinkSync(filePath);
    fs.rmdirSync(tmpDir);
  }
});

test('CLI - with options', async (t) => {
  const tmpDir = createTempDir();
  const filePath = path.join(tmpDir, 'hello.txt');
  fs.writeFileSync(filePath, 'Hello with options');

  const { child, url } = await startCliServing(['--cors', '--coi', tmpDir]);

  try {
    const res = await fetch(`${url}/hello.txt`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('access-control-allow-origin'), '*');
    assert.strictEqual(res.headers.get('cross-origin-embedder-policy'), 'require-corp');
  } finally {
    child.kill();
    await new Promise(r => setTimeout(r, 100));
    fs.unlinkSync(filePath);
    fs.rmdirSync(tmpDir);
  }
});
