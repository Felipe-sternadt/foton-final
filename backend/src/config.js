import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: resolve(projectRoot, '.env') });

function required(name, fallback = '') {
  const value = process.env[name] ?? fallback;

  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requiredWhen(enabled, name, fallback = '') {
  const value = process.env[name] ?? fallback;
  if (enabled && !value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const resendEnabled = process.env.RESEND_ENABLED === 'true';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER', 'root'),
    password: required('DB_PASSWORD', ''),
    database: required('DB_NAME', 'foton_leads'),
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  },
  crm: {
    enabled: process.env.CRM_ENABLED === 'true',
    endpoint: process.env.CRM_ENDPOINT || '',
    token: process.env.CRM_TOKEN || ''
  },
  resend: {
    enabled: resendEnabled,
    apiKey: requiredWhen(resendEnabled, 'RESEND_API_KEY'),
    from: requiredWhen(resendEnabled, 'RESEND_FROM'),
    recipients: Object.freeze({
      palhoca: process.env.RESEND_RECIPIENT_PALHOCA || 'gerencia.vendas1@somevalfoton.com.br',
      joinville: process.env.RESEND_RECIPIENT_JOINVILLE || 'gerencia.vendas2@somevalfoton.com.br',
      blumenau: process.env.RESEND_RECIPIENT_BLUMENAU || 'gerencia.vendas3@somevalfoton.com.br'
    })
  }
};
