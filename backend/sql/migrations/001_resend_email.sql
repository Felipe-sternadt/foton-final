-- Execute uma unica vez em bancos criados antes da integracao com o Resend.
USE foton_leads;

ALTER TABLE leads
  ADD COLUMN request_id CHAR(36) NULL AFTER public_id,
  ADD COLUMN email_status ENUM('pending', 'sent', 'failed', 'disabled') NOT NULL DEFAULT 'pending' AFTER crm_sent_at,
  ADD COLUMN email_recipient VARCHAR(180) NULL AFTER email_status,
  ADD COLUMN email_provider_id VARCHAR(100) NULL AFTER email_recipient,
  ADD COLUMN email_response JSON NULL AFTER email_provider_id,
  ADD COLUMN email_sent_at DATETIME NULL AFTER email_response,
  ADD UNIQUE KEY uq_leads_request_id (request_id),
  ADD KEY idx_leads_email_status (email_status);
