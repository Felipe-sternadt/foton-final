import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { pool } from '../src/db.js';

const port = Number(process.env.FLOW_AUDIT_PORT || 3187);
const baseUrl = `http://127.0.0.1:${port}`;
const requestIds = [];
const serverOutput = [];
const server = spawn(process.execPath, ['backend/src/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'development',
    RESEND_ENABLED: 'false',
    CRM_ENABLED: 'false'
  },
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe']
});
server.stdout.on('data', (chunk) => serverOutput.push(chunk.toString()));
server.stderr.on('data', (chunk) => serverOutput.push(chunk.toString()));

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {
      // O processo ainda esta iniciando.
    }
    if (server.exitCode !== null) throw new Error(serverOutput.join('').trim() || 'Audit server stopped');
    await delay(200);
  }
  throw new Error('Audit server did not become available');
}

async function submit(payload, requestId = randomUUID()) {
  requestIds.push(requestId);
  const response = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': requestId
    },
    body: JSON.stringify(payload)
  });
  return { status: response.status, body: await response.json() };
}

const baseLead = {
  name: 'Auditoria Automatizada',
  email: 'auditoria@example.com',
  phone: '(48) 99999-0000',
  state: 'SC',
  city: 'Cidade de Teste',
  model: 'Aumark S 315 MT',
  department: 'Veiculos Novos',
  message: 'Registro sintetico criado pela auditoria automatizada.',
  pageUrl: `${baseUrl}/auditoria`,
  lgpdConsent: true
};

try {
  await waitForServer();

  const missingId = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(baseLead)
  });
  assert.equal(missingId.status, 400);

  const invalidPayload = await submit({ name: 'X', phone: '123', dealershipUnit: 'Palhoça SC' });
  assert.equal(invalidPayload.status, 400);

  const quoteId = randomUUID();
  const quote = await submit({ ...baseLead, formType: 'quote', dealershipUnit: 'Palhoça SC' }, quoteId);
  assert.equal(quote.status, 201);
  assert.equal(quote.body.ok, true);
  assert.equal(quote.body.deliveryStatus, 'disabled');

  const duplicateQuote = await submit({ ...baseLead, formType: 'quote', dealershipUnit: 'Palhoça SC' }, quoteId);
  assert.equal(duplicateQuote.status, 200);
  assert.equal(duplicateQuote.body.duplicate, true);
  assert.equal(duplicateQuote.body.leadId, quote.body.leadId);

  const service = await submit({
    ...baseLead,
    formType: 'service',
    dealershipUnit: 'Joinville SC',
    department: 'Serviços',
    serviceType: 'Revisão'
  });
  assert.equal(service.status, 201);

  const parts = await submit({
    ...baseLead,
    formType: 'parts',
    dealershipUnit: 'Blumenau SC',
    department: 'Peças e acessórios'
  });
  assert.equal(parts.status, 201);

  const futureDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const testDrive = await submit({
    ...baseLead,
    formType: 'test_drive',
    dealershipUnit: 'Palhoça SC',
    document: '12345678901',
    preferredDate: futureDate,
    preferredTime: '10:00'
  });
  assert.equal(testDrive.status, 201);

  const invalidUnit = await submit({ ...baseLead, formType: 'quote', dealershipUnit: 'Unidade Inexistente' });
  assert.equal(invalidUnit.status, 400);

  const limited = await submit({ ...baseLead, formType: 'quote', dealershipUnit: 'Joinville SC' });
  assert.equal(limited.status, 429);

  console.log(JSON.stringify({
    ok: true,
    tested: [
      'missing_idempotency_key', 'invalid_payload', 'quote', 'duplicate_quote',
      'service', 'parts', 'test_drive', 'invalid_unit', 'rate_limit'
    ],
    createdLeadIds: [quote.body.leadId, service.body.leadId, parts.body.leadId, testDrive.body.leadId]
  }, null, 2));
} finally {
  const uniqueRequestIds = [...new Set(requestIds)];
  if (uniqueRequestIds.length) {
    const placeholders = uniqueRequestIds.map((_, index) => `:requestId${index}`).join(', ');
    const parameters = Object.fromEntries(uniqueRequestIds.map((id, index) => [`requestId${index}`, id]));
    await pool.execute(`DELETE FROM leads WHERE request_id IN (${placeholders})`, parameters);
  }
  await pool.end();
  server.kill();
}
