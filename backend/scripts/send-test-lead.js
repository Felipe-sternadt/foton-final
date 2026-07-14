import { randomUUID } from 'node:crypto';

if (process.env.ALLOW_TEST_LEAD !== 'true') {
  throw new Error('Defina ALLOW_TEST_LEAD=true para autorizar explicitamente a criacao de um lead de teste.');
}

const apiUrl = process.env.API_URL || 'http://localhost:3000/api/leads';

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': randomUUID()
  },
  body: JSON.stringify({
    formType: 'quote',
    name: 'Lead Teste Someval',
    email: 'lead.teste@example.com',
    phone: '48999999999',
    dealershipUnit: 'Palhoca SC',
    state: 'SC',
    city: 'Florianopolis',
    model: 'Aumark S 315 MT',
    department: 'Vendas',
    message: 'Teste automatico de envio para o banco.',
    pageUrl: 'http://localhost:5500/',
    utmSource: 'teste-local',
    utmMedium: 'manual',
    utmCampaign: 'validacao-backend',
    lgpdConsent: true
  })
});

console.log('Status:', response.status);
console.log(await response.text());
