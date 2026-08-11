import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { test, before, after } from 'node:test';

let baseUrl;
let configPath;
let serverProcess;

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // The child process may still be starting.
    }
    await delay(100);
  }
  throw new Error('Test server did not start');
};

before(async () => {
  const port = 51900 + Math.floor(Math.random() * 100);
  configPath = await mkdtemp(join(tmpdir(), 'amnezia-wg-easy-test-'));
  baseUrl = `http://127.0.0.1:${port}`;

  serverProcess = spawn(process.execPath, ['dist/server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DEBUG: '',
      NODE_ENV: 'development',
      PORT: String(port),
      WG_HOST: 'localhost',
      WG_PATH: configPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await waitForServer();
});

after(async () => {
  if (serverProcess && serverProcess.exitCode === null && serverProcess.signalCode === null) {
    serverProcess.kill('SIGINT');
    await new Promise((resolve) => serverProcess.once('exit', resolve));
  }
  await rm(configPath, { recursive: true, force: true });
});

test('serves the root page and API health route', async () => {
  const [root, health] = await Promise.all([
    fetch(`${baseUrl}/`),
    fetch(`${baseUrl}/api/health`),
  ]);

  assert.equal(root.status, 200);
  assert.match(await root.text(), /<!DOCTYPE html>/);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');
});

test('creates a client from a single JSON body read', async () => {
  const response = await fetch(`${baseUrl}/api/wireguard/client`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'test-client' }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });

  const config = JSON.parse(await readFile(join(configPath, 'wg0.json'), 'utf8'));
  const client = Object.values(config.clients).find(({ name }) => name === 'test-client');

  assert.ok(client);
  assert.ok(client.privateKey);
  assert.ok(client.publicKey);
  assert.ok(client.preSharedKey);
});
