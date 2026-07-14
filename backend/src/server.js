import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { pingDatabase } from './db.js';
import { leadRoutes } from './routes/leadRoutes.js';

const app = express();
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(currentDirectory, '../..');
const isProduction = config.env === 'production';

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: [
        "'self'",
        'https://servicodados.ibge.gov.br',
        'https://www.google-analytics.com',
        'https://region1.google-analytics.com'
      ],
      fontSrc: ["'self'", 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      frameSrc: ["'self'", 'https://maps.google.com', 'https://www.google.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(express.json({ limit: '80kb' }));

app.use(cors((req, callback) => {
  const origin = req.get('origin');
  const ownOrigin = `${req.protocol}://${req.get('host')}`;
  const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  const isLocalDevelopmentOrigin = !isProduction && isLocalOrigin;
  const isConfiguredOrigin = config.corsOrigins.includes(origin)
    && (!isProduction || !isLocalOrigin);
  const allowed = !origin
    || origin === ownOrigin
    || isLocalDevelopmentOrigin
    || isConfiguredOrigin;
  callback(null, {
    origin: allowed ? origin || false : false,
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Idempotency-Key'],
    maxAge: 86400
  });
}));

app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/health', async (_req, res) => {
  try {
    const dbOk = await pingDatabase();
    res.json({ ok: true, database: dbOk ? 'connected' : 'unavailable' });
  } catch (error) {
    res.status(503).json({
      ok: false,
      database: 'unavailable',
      message: config.env === 'production' ? 'Database unavailable' : (error.message || error.code || 'Database unavailable')
    });
  }
});

app.use('/api/leads', leadRoutes);

const staticOptions = {
  dotfiles: 'deny',
  etag: true,
  fallthrough: true,
  index: false,
  maxAge: isProduction ? '1d' : 0,
  redirect: false,
  setHeaders(res, filePath) {
    res.set('X-Content-Type-Options', 'nosniff');
    if (filePath.toLowerCase().endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
    }
  }
};

// Somente estes diretorios sao publicos. Backend, .env e configuracoes nunca sao expostos.
app.use('/assets', express.static(join(siteRoot, 'assets'), staticOptions));
app.use('/pages', express.static(join(siteRoot, 'pages'), staticOptions));
app.use('/models', express.static(join(siteRoot, 'models'), staticOptions));

app.get(['/', '/index.html'], (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(join(siteRoot, 'index.html'));
});

app.use((_req, res) => {
  res.status(404).type('text/plain').send('Pagina nao encontrada');
});

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      ok: false,
      message: 'A solicitacao excede o tamanho permitido'
    });
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      ok: false,
      message: 'O conteudo enviado nao possui um formato valido'
    });
  }

  console.error(error?.message || 'Internal server error');
  res.status(500).json({
    ok: false,
    message: 'Nao foi possivel processar a solicitacao. Tente novamente em alguns instantes.'
  });
});

app.listen(config.port, () => {
  console.log(`Foton leads API running on port ${config.port}`);
});
