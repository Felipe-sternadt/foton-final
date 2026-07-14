import { config } from '../config.js';

const CRM_TIMEOUT_MS = 10000;

export async function sendLeadToCrm(lead) {
  if (!config.crm.enabled) {
    return {
      status: 'disabled',
      response: { message: 'CRM integration disabled' }
    };
  }

  if (!config.crm.endpoint || !config.crm.token) {
    return {
      status: 'failed',
      response: { message: 'CRM endpoint or token missing' }
    };
  }

  try {
    const response = await fetch(config.crm.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.crm.token}`,
        'Idempotency-Key': `crm-lead/${lead.id}`
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS)
    });

    const responseText = (await response.text()).slice(0, 4000);
    let responseBody = responseText;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      // Mantem respostas de texto simples sem ultrapassar o limite acima.
    }

    return {
      status: response.ok ? 'sent' : 'failed',
      response: {
        statusCode: response.status,
        body: responseBody
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      response: {
        message: error?.name === 'TimeoutError' ? 'CRM request timed out' : 'CRM unavailable'
      }
    };
  }
}
