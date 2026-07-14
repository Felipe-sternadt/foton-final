import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { leadSchema } from '../validators/leadValidator.js';
import { createLead, updateLeadCrmStatus, updateLeadEmailStatus } from '../repositories/leadRepository.js';
import { sendLeadToCrm } from '../services/crmService.js';
import { sendLeadEmail } from '../services/emailService.js';
import { config } from '../config.js';

export const leadRoutes = Router();

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const leadSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      ok: false,
      message: 'Muitas tentativas de envio. Aguarde alguns minutos e tente novamente.'
    });
  }
});

leadRoutes.post('/', leadSubmissionLimiter, async (req, res, next) => {
  try {
    const requestId = req.get('idempotency-key') || '';
    if (!requestIdPattern.test(requestId)) {
      return res.status(400).json({
        ok: false,
        message: 'Identificador de envio ausente ou invalido'
      });
    }

    const lead = leadSchema.parse(req.body);
    const leadRecord = await createLead(lead, requestId);
    const { publicId } = leadRecord;

    if (leadRecord.duplicate && leadRecord.emailStatus === 'sent') {
      return res.status(200).json({
        ok: true,
        leadId: publicId,
        duplicate: true,
        deliveryStatus: 'sent'
      });
    }

    const [emailResult, crmResult] = await Promise.all([
      sendLeadEmail(lead, publicId),
      leadRecord.duplicate
        ? Promise.resolve(null)
        : sendLeadToCrm({ id: publicId, ...lead })
    ]);

    await updateLeadEmailStatus(publicId, emailResult);
    if (crmResult) await updateLeadCrmStatus(publicId, crmResult);

    if (config.resend.enabled && emailResult.status !== 'sent') {
      return res.status(503).json({
        ok: false,
        leadId: publicId,
        message: 'Lead recebido, mas a notificacao esta pendente. Tente novamente.'
      });
    }

    res.status(leadRecord.duplicate ? 200 : 201).json({
      ok: true,
      leadId: publicId,
      duplicate: leadRecord.duplicate,
      deliveryStatus: emailResult.status,
      crmStatus: crmResult?.status || undefined
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid lead data',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    next(error);
  }
});
