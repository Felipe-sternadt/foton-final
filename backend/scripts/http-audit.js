import { spawn } from 'node:child_process';
import { globSync } from 'node:fs';
import assert from 'node:assert/strict';

const port = Number(process.env.HTTP_AUDIT_PORT || 3188);
const baseUrl = `http://127.0.0.1:${port}`;
const isProduction = process.env.NODE_ENV === 'production';
const output = [];
const server = spawn(process.execPath, ['backend/src/server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), RESEND_ENABLED: 'false', CRM_ENABLED: 'false' },
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe']
});
server.stdout.on('data', (chunk) => output.push(chunk.toString()));
server.stderr.on('data', (chunk) => output.push(chunk.toString()));

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {
      // Servidor ainda iniciando.
    }
    if (server.exitCode !== null) throw new Error(output.join('').trim() || 'Audit server stopped');
    await delay(200);
  }
  throw new Error('HTTP audit server did not become available');
}

try {
  await waitForServer();

  const publicFiles = globSync(['assets/**/*.*', 'pages/**/*.*', 'models/**/*.*'], {
    cwd: process.cwd(),
    exclude: ['**/*.md']
  }).map((path) => `/${path.replaceAll('\\', '/')}`);

  for (const path of ['/', ...publicFiles]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} should be public`);
  }

  for (let index = 0; index < 75; index += 1) {
    assert.equal((await fetch(`${baseUrl}/`)).status, 200);
  }

  const home = await fetch(`${baseUrl}/`);
  assert.match(home.headers.get('content-security-policy') || '', /default-src 'self'/);
  if (isProduction) assert.match(home.headers.get('content-security-policy') || '', /upgrade-insecure-requests/);
  assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(home.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(home.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(home.headers.has('x-powered-by'), false);

  for (const path of [
    '/.env', '/package.json', '/package-lock.json', '/backend/src/server.js',
    '/backend/schema.sql', '/.git/config', '/assets/../.env', '/nao-existe'
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 404, `${path} must not be public`);
  }

  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).database, 'connected');

  const malformed = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: '{invalid'
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).ok, false);

  const oversized = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ value: 'x'.repeat(90000) })
  });
  assert.equal(oversized.status, 413);

  const deniedCors = await fetch(`${baseUrl}/api/leads`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://malicious.example',
      'Access-Control-Request-Method': 'POST'
    }
  });
  assert.equal(deniedCors.headers.has('access-control-allow-origin'), false);

  const allowedCors = await fetch(`${baseUrl}/api/leads`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5500',
      'Access-Control-Request-Method': 'POST'
    }
  });
  assert.equal(
    allowedCors.headers.get('access-control-allow-origin'),
    isProduction ? null : 'http://localhost:5500'
  );

  console.log(JSON.stringify({
    ok: true,
    publicFiles: publicFiles.length,
    repeatedPageLoads: 75,
    protectedPaths: 8,
    headers: 'validated',
    database: 'connected',
    malformedJson: 'rejected',
    oversizedBody: 'rejected',
    cors: 'validated',
    environment: isProduction ? 'production' : 'development'
  }, null, 2));
} finally {
  server.kill();
}
