import { randomUUID } from 'node:crypto';
import { pool } from '../db.js';

async function findLeadByRequestId(requestId) {
  const [rows] = await pool.execute(
    `SELECT public_id AS publicId, email_status AS emailStatus
     FROM leads
     WHERE request_id = :requestId
     LIMIT 1`,
    { requestId }
  );
  return rows[0] || null;
}

export async function createLead(lead, requestId) {
  const publicId = randomUUID();

  try {
    await pool.execute(
      `INSERT INTO leads (
        public_id, request_id, form_type, name, email, phone, document, dealership_unit,
        state, city, model, department, service_type, preferred_date, preferred_time,
        message, page_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        gclid, fbclid, lgpd_consent, crm_status, email_status, raw_payload
      ) VALUES (
        :publicId, :requestId, :formType, :name, :email, :phone, :document, :dealershipUnit,
        :state, :city, :model, :department, :serviceType, :preferredDate, :preferredTime,
        :message, :pageUrl, :utmSource, :utmMedium, :utmCampaign, :utmTerm, :utmContent,
        :gclid, :fbclid, :lgpdConsent, 'pending', 'pending', :rawPayload
      )`,
      {
        publicId,
        requestId,
        formType: lead.formType,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        document: lead.document,
        dealershipUnit: lead.dealershipUnit,
        state: lead.state,
        city: lead.city,
        model: lead.model,
        department: lead.department,
        serviceType: lead.serviceType,
        preferredDate: lead.preferredDate,
        preferredTime: lead.preferredTime,
        message: lead.message,
        pageUrl: lead.pageUrl,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        utmTerm: lead.utmTerm,
        utmContent: lead.utmContent,
        gclid: lead.gclid,
        fbclid: lead.fbclid,
        lgpdConsent: lead.lgpdConsent ? 1 : 0,
        // Evita uma segunda copia desnecessaria dos dados pessoais no banco.
        rawPayload: JSON.stringify({ schemaVersion: 2, source: 'website' })
      }
    );
  } catch (error) {
    if (error?.code !== 'ER_DUP_ENTRY') throw error;
    const existing = await findLeadByRequestId(requestId);
    if (!existing) throw error;
    return { ...existing, duplicate: true };
  }

  return {
    publicId,
    emailStatus: 'pending',
    duplicate: false
  };
}

export async function updateLeadEmailStatus(publicId, emailResult) {
  await pool.execute(
    `UPDATE leads
     SET email_response = CASE
           WHEN email_status = 'sent' THEN email_response
           ELSE :emailResponse
         END,
         email_status = CASE
           WHEN email_status = 'sent' THEN 'sent'
           ELSE :emailStatus
         END,
         email_recipient = COALESCE(email_recipient, :emailRecipient),
         email_provider_id = COALESCE(email_provider_id, :emailProviderId),
         email_sent_at = CASE
           WHEN :emailStatus = 'sent' THEN COALESCE(email_sent_at, NOW())
           ELSE email_sent_at
         END
     WHERE public_id = :publicId`,
    {
      publicId,
      emailStatus: emailResult.status,
      emailRecipient: emailResult.recipient,
      emailProviderId: emailResult.response?.providerId || null,
      emailResponse: JSON.stringify(emailResult.response || {})
    }
  );
}

export async function updateLeadCrmStatus(publicId, crmResult) {
  await pool.execute(
    `UPDATE leads
     SET crm_status = :crmStatus,
         crm_response = :crmResponse,
         crm_sent_at = CASE WHEN :crmStatus = 'sent' THEN NOW() ELSE crm_sent_at END
     WHERE public_id = :publicId`,
    {
      publicId,
      crmStatus: crmResult.status,
      crmResponse: JSON.stringify(crmResult.response)
    }
  );
}
