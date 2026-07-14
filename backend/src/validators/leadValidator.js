import { z } from 'zod';

const emptyToUndefined = (value) => {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const optionalText = (max) => z.preprocess(
  emptyToUndefined,
  z.string().trim().max(max).optional().nullable()
).transform((value) => value ?? null);

const dealershipUnit = z.string().trim().transform((value, context) => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  const allowedUnits = {
    palhocasc: 'Palhoça SC',
    joinvillesc: 'Joinville SC',
    blumenausc: 'Blumenau SC'
  };

  if (!allowedUnits[normalized]) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecione uma unidade valida'
    });
    return z.NEVER;
  }

  return allowedUnits[normalized];
});

const requiredFieldsByForm = {
  quote: ['email', 'state', 'city', 'model', 'department', 'message'],
  service: ['email', 'state', 'city', 'model', 'department', 'serviceType', 'message'],
  parts: ['email', 'state', 'city', 'department', 'message'],
  test_drive: ['email', 'document', 'state', 'city', 'model', 'preferredDate', 'preferredTime']
};

function currentDateInSaoPaulo() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export const leadSchema = z.object({
  formType: z.enum(['quote', 'test_drive', 'service', 'parts', 'contact']).default('contact'),
  name: z.string().trim().min(2).max(160),
  email: z.preprocess(
    emptyToUndefined,
    z.string().trim().email().max(180).optional().nullable()
  ).transform((value) => value ?? null),
  phone: z.string().trim().min(8).max(40).refine(
    (value) => /^\d{8,15}$/.test(value.replace(/\D/g, '')),
    'Informe um telefone valido'
  ),
  document: optionalText(40),
  dealershipUnit,
  state: optionalText(80),
  city: optionalText(120),
  model: optionalText(160),
  department: optionalText(120),
  serviceType: optionalText(120),
  preferredDate: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
  ).transform((value) => value ?? null),
  preferredTime: optionalText(20),
  message: optionalText(4000),
  pageUrl: optionalText(500),
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(180),
  utmTerm: optionalText(180),
  utmContent: optionalText(180),
  gclid: optionalText(255),
  fbclid: optionalText(255),
  lgpdConsent: z.literal(true, {
    errorMap: () => ({ message: 'O consentimento para atendimento e obrigatorio' })
  })
}).superRefine((lead, context) => {
  for (const field of requiredFieldsByForm[lead.formType] || []) {
    if (lead[field]) continue;
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: `O campo ${field} e obrigatorio para este formulario`
    });
  }

  if (lead.formType !== 'test_drive') return;

  const documentDigits = String(lead.document || '').replace(/\D/g, '');
  if (lead.document && ![11, 14].includes(documentDigits.length)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['document'],
      message: 'Informe um CPF ou CNPJ valido'
    });
  }

  if (lead.preferredDate && lead.preferredDate < currentDateInSaoPaulo()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['preferredDate'],
      message: 'A data do test drive nao pode estar no passado'
    });
  }

  if (lead.preferredTime && !['08:30', '10:00', '13:30', '15:00', '16:30'].includes(lead.preferredTime)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['preferredTime'],
      message: 'Selecione um horario valido para o test drive'
    });
  }
});
