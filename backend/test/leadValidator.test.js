import test from 'node:test';
import assert from 'node:assert/strict';
import { leadSchema } from '../src/validators/leadValidator.js';

const baseLead = {
  formType: 'quote',
  name: 'Lead de Teste',
  email: 'lead@example.com',
  phone: '(48) 99999-9999',
  dealershipUnit: 'Palhoça SC',
  state: 'SC',
  city: 'Palhoça',
  model: 'Aumark S 315 MT',
  department: 'Veículos Novos',
  message: 'Desejo receber uma proposta.',
  lgpdConsent: true
};

test('aceita uma cotacao completa e normaliza a unidade', () => {
  const lead = leadSchema.parse(baseLead);
  assert.equal(lead.dealershipUnit, 'Palhoça SC');
});

test('rejeita campos obrigatorios ausentes conforme o tipo do formulario', () => {
  const result = leadSchema.safeParse({ ...baseLead, formType: 'service', serviceType: null });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path.join('.') === 'serviceType'));
});

test('rejeita telefone invalido e consentimento ausente', () => {
  const result = leadSchema.safeParse({ ...baseLead, phone: '123', lgpdConsent: false });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path.join('.') === 'phone'));
  assert.ok(result.error.issues.some((issue) => issue.path.join('.') === 'lgpdConsent'));
});

test('rejeita test drive com documento, data ou horario invalidos', () => {
  const result = leadSchema.safeParse({
    ...baseLead,
    formType: 'test_drive',
    document: '123',
    preferredDate: '2000-01-01',
    preferredTime: '03:00'
  });
  assert.equal(result.success, false);
  for (const path of ['document', 'preferredDate', 'preferredTime']) {
    assert.ok(result.error.issues.some((issue) => issue.path.join('.') === path));
  }
});
