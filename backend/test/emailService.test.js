import test from 'node:test';
import assert from 'node:assert/strict';

process.env.RESEND_ENABLED = 'true';
process.env.RESEND_API_KEY = 'test_api_key';
process.env.RESEND_FROM = 'Leads Someval Foton <leads@somevalfoton.com.br>';

const {
  buildLeadEmail,
  resolveLeadRecipient,
  sendLeadEmail
} = await import('../src/services/emailService.js');
const { leadSchema } = await import('../src/validators/leadValidator.js');

const sampleLead = {
  formType: 'test_drive',
  name: 'Cliente <Teste>',
  email: 'cliente@example.com',
  phone: '48999999999',
  document: '12345678901',
  dealershipUnit: 'Palhoça SC',
  state: 'SC',
  city: 'Palhoça',
  model: 'Aumark S 315',
  department: null,
  serviceType: null,
  preferredDate: '2026-07-20',
  preferredTime: '10:00',
  message: '<script>alert(1)</script>',
  lgpdConsent: true
};

test('roteia apenas as tres unidades autorizadas', () => {
  assert.equal(resolveLeadRecipient('Palhoça SC'), 'gerencia.vendas1@somevalfoton.com.br');
  assert.equal(resolveLeadRecipient('Palhoca SC'), 'gerencia.vendas1@somevalfoton.com.br');
  assert.equal(resolveLeadRecipient('Joinville SC'), 'gerencia.vendas2@somevalfoton.com.br');
  assert.equal(resolveLeadRecipient('Blumenau SC'), 'gerencia.vendas3@somevalfoton.com.br');
  assert.equal(resolveLeadRecipient('destino@atacante.example'), null);
});

test('normaliza a unidade e rejeita unidades fora da lista', () => {
  assert.equal(leadSchema.parse(sampleLead).dealershipUnit, 'Palhoça SC');
  assert.throws(() => leadSchema.parse({ ...sampleLead, dealershipUnit: 'Outra unidade' }));
  assert.throws(() => leadSchema.parse({ ...sampleLead, lgpdConsent: false }));
});

test('escapa HTML fornecido pelo lead e remove quebra de linha do assunto', () => {
  const email = buildLeadEmail({
    ...sampleLead,
    dealershipUnit: 'Palhoça SC\r\nBcc: atacante@example.com'
  }, '00000000-0000-4000-8000-000000000001');

  assert.doesNotMatch(email.html, /<script>/i);
  assert.match(email.html, /&lt;script&gt;/i);
  assert.doesNotMatch(email.subject, /[\r\n]/);
});

test('usa destinatario fechado e chave idempotente estavel no Resend', async (context) => {
  const requests = [];
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options, body: JSON.parse(options.body) });
    return new Response(JSON.stringify({ id: 'email_test_123' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  });

  const publicId = '00000000-0000-4000-8000-000000000001';
  await sendLeadEmail(sampleLead, publicId);
  await sendLeadEmail(sampleLead, publicId);

  assert.equal(requests.length, 2);
  assert.equal(requests[0].body.to[0], 'gerencia.vendas1@somevalfoton.com.br');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test_api_key');
  assert.equal(requests[0].options.headers['Idempotency-Key'], `lead-notification/${publicId}`);
  assert.equal(requests[1].options.headers['Idempotency-Key'], requests[0].options.headers['Idempotency-Key']);
});
