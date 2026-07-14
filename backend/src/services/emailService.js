import { config } from '../config.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 10000;

function normalizeUnit(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

export function resolveLeadRecipient(dealershipUnit) {
  const keyByUnit = {
    palhocasc: 'palhoca',
    joinvillesc: 'joinville',
    blumenausc: 'blumenau'
  };
  const recipientKey = keyByUnit[normalizeUnit(dealershipUnit)];
  return recipientKey ? config.resend.recipients[recipientKey] : null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeHeader(value, maxLength = 120) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}

function display(value) {
  return value ? String(value) : 'Não informado';
}

const formLabels = {
  quote: 'Solicitação de cotação',
  test_drive: 'Agendamento de test drive',
  service: 'Solicitação de serviço',
  parts: 'Peças e acessórios',
  contact: 'Contato pelo site'
};

export function buildLeadEmail(lead, publicId) {
  const fields = [
    ['Nome', lead.name],
    ['E-mail', lead.email],
    ['Telefone', lead.phone],
    ['CPF/CNPJ', lead.document],
    ['Unidade', lead.dealershipUnit],
    ['Estado', lead.state],
    ['Cidade', lead.city],
    ['Modelo', lead.model],
    ['Departamento', lead.department],
    ['Serviço', lead.serviceType],
    ['Data preferencial', lead.preferredDate],
    ['Horário preferencial', lead.preferredTime],
    ['Mensagem', lead.message]
  ];
  const typeLabel = formLabels[lead.formType] || formLabels.contact;
  const rows = fields.map(([label, value]) => `
    <tr>
      <th style="padding:8px 12px;text-align:left;vertical-align:top;background:#f4f7fb;border:1px solid #dbe3ef">${escapeHtml(label)}</th>
      <td style="padding:8px 12px;white-space:pre-wrap;border:1px solid #dbe3ef">${escapeHtml(display(value))}</td>
    </tr>`).join('');
  const text = [
    typeLabel,
    `Protocolo: ${publicId}`,
    ...fields.map(([label, value]) => `${label}: ${display(value)}`)
  ].join('\n');

  return {
    subject: safeHeader(`[Foton] ${typeLabel} - ${lead.dealershipUnit}`),
    html: `<!doctype html><html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#14213d">
      <h1 style="font-size:22px">${escapeHtml(typeLabel)}</h1>
      <p><strong>Protocolo:</strong> ${escapeHtml(publicId)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px">${rows}</table>
      <p style="margin-top:20px;color:#5c667a;font-size:12px">Dados enviados voluntariamente pelo formulário do site. Trate estas informações conforme a LGPD e não encaminhe para destinatários não autorizados.</p>
    </body></html>`,
    text
  };
}

export async function sendLeadEmail(lead, publicId) {
  if (!config.resend.enabled) {
    return { status: 'disabled', recipient: null, response: { reason: 'resend_disabled' } };
  }

  const recipient = resolveLeadRecipient(lead.dealershipUnit);
  if (!recipient) {
    return { status: 'failed', recipient: null, response: { reason: 'invalid_dealership_unit' } };
  }

  const email = buildLeadEmail(lead, publicId);
  const payload = {
    from: config.resend.from,
    to: [recipient],
    subject: email.subject,
    html: email.html,
    text: email.text,
    reply_to: lead.email || undefined,
    tags: [
      { name: 'form_type', value: lead.formType },
      { name: 'dealership_unit', value: normalizeUnit(lead.dealershipUnit).replace(/sc$/, '') }
    ]
  };

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resend.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `lead-notification/${publicId}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        status: 'failed',
        recipient,
        response: {
          statusCode: response.status,
          reason: safeHeader(responseBody?.name || 'resend_request_failed', 80)
        }
      };
    }

    return {
      status: 'sent',
      recipient,
      response: { providerId: responseBody.id || null }
    };
  } catch (error) {
    return {
      status: 'failed',
      recipient,
      response: {
        reason: error?.name === 'TimeoutError' ? 'resend_timeout' : 'resend_unavailable'
      }
    };
  }
}
