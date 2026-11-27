import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { test, describe, before, after } from 'node:test';

import bcrypt from 'bcryptjs';

const waitForServer = async (baseUrl) => {
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

describe('auth without password', () => {
  let baseUrl;
  let configPath;
  let serverProcess;

  before(async () => {
    const port = 51920 + Math.floor(Math.random() * 100);
    configPath = await mkdtemp(join(tmpdir(), 'amnezia-wg-easy-auth-'));
    baseUrl = `http://127.0.0.1:${port}`;

    serverProcess = spawn(process.execPath, ['dist/server.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DEBUG: '',
        NODE_ENV: 'development',
        HTTP_PORT: String(port),
        WG_HOST: 'localhost',
        WG_PATH: configPath,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await waitForServer(baseUrl);
  });

  after(async () => {
    if (serverProcess && serverProcess.exitCode === null && serverProcess.signalCode === null) {
      serverProcess.kill('SIGINT');
      await new Promise((resolve) => serverProcess.once('exit', resolve));
    }
    await rm(configPath, { recursive: true, force: true });
  });

  test('reports no password required and auto-authenticates', async () => {
    const response = await fetch(`${baseUrl}/api/session`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      requiresPassword: false,
      authenticated: true,
    });
  });
});

describe('auth with password', () => {
  let baseUrl;
  let configPath;
  let serverProcess;
  const password = 'test-password-123';
  let passwordHash;

  before(async () => {
    passwordHash = await bcrypt.hash(password, 10);
    const port = 51940 + Math.floor(Math.random() * 100);
    configPath = await mkdtemp(join(tmpdir(), 'amnezia-wg-easy-auth-'));
    baseUrl = `http://127.0.0.1:${port}`;

    serverProcess = spawn(process.execPath, ['dist/server.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DEBUG: '',
        NODE_ENV: 'development',
        HTTP_PORT: String(port),
        WG_HOST: 'localhost',
        WG_PATH: configPath,
        PASSWORD_HASH: passwordHash,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await waitForServer(baseUrl);
  });

  after(async () => {
    if (serverProcess && serverProcess.exitCode === null && serverProcess.signalCode === null) {
      serverProcess.kill('SIGINT');
      await new Promise((resolve) => serverProcess.once('exit', resolve));
    }
    await rm(configPath, { recursive: true, force: true });
  });

  test('reports password required and not authenticated', async () => {
    const response = await fetch(`${baseUrl}/api/session`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      requiresPassword: true,
      authenticated: false,
    });
  });

  test('rejects wrong password', async () => {
    const response = await fetch(`${baseUrl}/api/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password', remember: false }),
    });
    assert.equal(response.status, 401);
  });

  test('accepts correct password and sets session cookie', async () => {
    const response = await fetch(`${baseUrl}/api/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password, remember: false }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });

    const setCookie = response.headers.get('set-cookie');
    assert.ok(setCookie, 'should set a session cookie');
  });
});