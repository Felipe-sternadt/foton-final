import test from 'node:test';
import assert from 'node:assert/strict';

process.env.CRM_ENABLED = 'true';
process.env.CRM_ENDPOINT = 'https://crm.example.test/leads';
process.env.CRM_TOKEN = 'test_crm_token';

const { sendLeadToCrm } = await import('../src/services/crmService.js');

test('envia ao CRM com idempotencia, token no header e timeout', async (context) => {
  const requests = [];
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({ accepted: true }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  });

  const result = await sendLeadToCrm({ id: 'lead-123', name: 'Lead de Teste' });
  assert.equal(result.status, 'sent');
  assert.equal(requests[0].url, 'https://crm.example.test/leads');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test_crm_token');
  assert.equal(requests[0].options.headers['Idempotency-Key'], 'crm-lead/lead-123');
  assert.ok(requests[0].options.signal instanceof AbortSignal);
});

test('transforma indisponibilidade do CRM em resultado controlado', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('network unavailable');
  });

  const result = await sendLeadToCrm({ id: 'lead-456' });
  assert.deepEqual(result, {
    status: 'failed',
    response: { message: 'CRM unavailable' }
  });
});
