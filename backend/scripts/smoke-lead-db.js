import { randomUUID } from 'node:crypto';
import { pool } from '../src/db.js';
import { createLead, updateLeadEmailStatus } from '../src/repositories/leadRepository.js';

const requestId = randomUUID();

const testLead = {
  formType: 'service',
  name: 'Teste automatico do banco',
  email: 'database-smoke-test@example.invalid',
  phone: '48999999999',
  document: null,
  dealershipUnit: 'Palhoça SC',
  state: 'SC',
  city: 'Palhoça',
  model: 'Modelo de teste',
  department: 'Serviços',
  serviceType: 'Revisão',
  preferredDate: null,
  preferredTime: null,
  message: 'Registro temporario criado pelo teste de integracao.',
  pageUrl: 'http://localhost/database-smoke-test',
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  gclid: null,
  fbclid: null,
  lgpdConsent: true
};

try {
  const record = await createLead(testLead, requestId);
  await updateLeadEmailStatus(record.publicId, {
    status: 'disabled',
    recipient: null,
    response: { reason: 'database_smoke_test' }
  });

  const [rows] = await pool.execute(
    `SELECT request_id, email_status
     FROM leads
     WHERE request_id = :requestId`,
    { requestId }
  );

  if (rows.length !== 1 || rows[0].email_status !== 'disabled') {
    throw new Error('O registro temporario nao foi persistido corretamente.');
  }

  console.log('Lead database smoke test passed.');
} finally {
  // Remove exclusivamente o registro sintetico identificado pelo UUID deste teste.
  await pool.execute(
    'DELETE FROM leads WHERE request_id = :requestId',
    { requestId }
  );
  await pool.end();
}
