import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const screenshotDirectory = process.env.SCREENSHOT_DIR || '';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9333;
const profileDirectory = await mkdtemp(join(tmpdir(), 'foton-browser-audit-'));
const pages = [
  '/',
  '/pages/novos.html',
  '/pages/concessionarias.html',
  '/pages/servicos.html',
  '/pages/pecas-acessorios.html',
  '/pages/test-drive.html',
  '/models/auman-d-1722.html',
  '/models/auman-d-1830.html',
  '/models/auman-d-2632.html',
  '/models/aumark-s-1217.html',
  '/models/aumark-s-315.html',
  '/models/aumark-s-715.html',
  '/models/aumark-s-916.html',
  '/models/eaumark.html',
  '/models/etoano-pro.html',
  '/models/eview-connect.html',
  '/models/eview-grand.html',
  '/models/ewonder.html',
  '/models/tunland-v7.html',
  '/models/tunland-v9.html',
  '/models/tunland.html'
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true }
];

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-extensions',
  '--disable-background-networking',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-address=127.0.0.1',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDirectory}`,
  'about:blank'
], { stdio: 'ignore', windowsHide: true });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForChrome() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome ainda esta iniciando.
    }
    await delay(250);
  }
  throw new Error('Chrome DevTools did not become available');
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let sequence = 0;
  const pending = new Map();
  const listeners = new Set();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    for (const listener of listeners) listener(message);
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  return {
    ready,
    onEvent(listener) { listeners.add(listener); },
    send(method, params = {}) {
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { socket.close(); }
  };
}

async function auditPage(path, viewport, { bypassConsent = true, scenario = 'page' } = {}) {
  const targetResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' });
  const target = await targetResponse.json();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;

  const runtimeErrors = [];
  const failedRequests = [];
  const requestUrls = new Map();
  cdp.onEvent((message) => {
    if (message.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(message.params.exceptionDetails?.text || 'Uncaught exception');
    }
    if (message.method === 'Network.requestWillBeSent') {
      requestUrls.set(message.params.requestId, message.params.request.url);
    }
    if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
      failedRequests.push({
        url: requestUrls.get(message.params.requestId) || null,
        error: message.params.errorText || 'Network request failed'
      });
    }
  });

  await Promise.all([
    cdp.send('Page.enable'),
    cdp.send('Runtime.enable'),
    cdp.send('Network.enable')
  ]);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile
  });
  if (bypassConsent) {
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: "localStorage.setItem('foton_cookies_accepted_v1', 'denied')"
    });
  } else {
    await cdp.send('Storage.clearDataForOrigin', {
      origin: baseUrl,
      storageTypes: 'local_storage,cookies'
    });
  }

  const loaded = new Promise((resolve) => {
    const timeout = setTimeout(resolve, 8000);
    cdp.onEvent((message) => {
      if (message.method === 'Page.loadEventFired') {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
  const navigation = await cdp.send('Page.navigate', { url: `${baseUrl}${path}` });
  await loaded;
  await delay(600);

  const evaluation = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const brokenImages = [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      const imagesWithoutAlt = [...document.images]
        .filter((image) => !image.hasAttribute('alt'))
        .map((image) => image.currentSrc || image.src);
      const forms = [...document.querySelectorAll('form[data-lead-form]')].map((form) => {
        const consent = form.querySelector('.lead-consent');
        const checkbox = consent?.querySelector('input[type="checkbox"]');
        const copy = consent?.querySelector('span');
        const formRect = form.getBoundingClientRect();
        const consentRect = consent?.getBoundingClientRect();
        const checkboxRect = checkbox?.getBoundingClientRect();
        const copyRect = copy?.getBoundingClientRect();
        return {
          type: form.dataset.leadForm,
          controls: form.querySelectorAll('input, select, textarea').length,
          unnamed: [...form.querySelectorAll('input, select, textarea')]
            .filter((field) => !field.name).length,
          submitButtons: form.querySelectorAll('[type="submit"]').length,
          consent: consentRect && checkboxRect && copyRect ? {
            checkboxWidth: Math.round(checkboxRect.width),
            copyWidth: Math.round(copyRect.width),
            horizontalOverflow: consent.scrollWidth - consent.clientWidth,
            fits: consentRect.left >= formRect.left - 1
              && consentRect.right <= formRect.right + 1
              && checkboxRect.width >= 16
              && checkboxRect.width <= 28
              && copyRect.left >= checkboxRect.right
              && copyRect.right <= consentRect.right + 1
              && copyRect.width >= 100
              && consent.scrollWidth <= consent.clientWidth + 1
          } : null
        };
      });
      const text = document.body?.innerText || '';
      const cookieDialog = document.querySelector('.cookie-gate-dialog');
      const cookieRect = cookieDialog?.getBoundingClientRect();
      const originalScrollX = window.scrollX;
      window.scrollTo(100000, window.scrollY);
      const horizontalScrollReach = window.scrollX;
      window.scrollTo(originalScrollX, window.scrollY);
      const overflowingElements = [...document.querySelectorAll('body *')]
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2))
        .slice(0, 12)
        .map(({ element, rect }) => ({
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          classes: [...element.classList].slice(0, 4),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        }));
      return {
        title: document.title,
        statusText: document.body?.innerText?.slice(0, 80) || '',
        horizontalOverflow: Math.max(
          document.documentElement.scrollWidth,
          document.body?.scrollWidth || 0
        ) - window.innerWidth,
        horizontalScrollReach,
        overflowingElements,
        brokenImages,
        imagesWithoutAlt,
        forms,
        cookieConsent: cookieRect ? {
          buttons: cookieDialog.querySelectorAll('button').length,
          left: Math.round(cookieRect.left),
          right: Math.round(cookieRect.right),
          top: Math.round(cookieRect.top),
          bottom: Math.round(cookieRect.bottom),
          fitsViewport: cookieRect.left >= 0
            && cookieRect.right <= window.innerWidth
            && cookieRect.top >= 0
            && cookieRect.bottom <= window.innerHeight
        } : null,
        mojibake: /Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|�/.test(text),
        analyticsLoaded: typeof window.fotonAnalytics !== 'undefined',
        mainScriptLoaded: [...document.scripts].some((script) => script.src.endsWith('/assets/js/script.js'))
      };
    })()`
  });

  if (screenshotDirectory && viewport.name === 'mobile' && scenario === 'page' && evaluation.result.value.forms.length) {
    await mkdir(screenshotDirectory, { recursive: true });
    await cdp.send('Runtime.evaluate', {
      expression: "document.querySelector('form[data-lead-form] .lead-consent')?.scrollIntoView({ block: 'center' })"
    });
    await delay(300);
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const fileName = `${path === '/' ? 'home' : path.split('/').at(-1).replace('.html', '')}-mobile.png`;
    await writeFile(join(screenshotDirectory, fileName), Buffer.from(screenshot.data, 'base64'));
  }

  cdp.close();
  await fetch(`http://127.0.0.1:${debugPort}/json/close/${target.id}`);

  return {
    path,
    viewport: viewport.name,
    scenario,
    navigationError: navigation.errorText || null,
    runtimeErrors,
    failedRequests,
    localFailedRequests: failedRequests.filter((request) => request.url?.startsWith(baseUrl)),
    ...evaluation.result.value
  };
}

try {
  await waitForChrome();
  const results = [];
  for (const viewport of viewports) {
    for (const page of pages) results.push(await auditPage(page, viewport));
  }
  results.push(await auditPage('/', viewports[1], {
    bypassConsent: false,
    scenario: 'cookie_consent'
  }));

  const failures = results.filter((result) =>
    result.navigationError
    || result.runtimeErrors.length
    || result.localFailedRequests.length
    || !result.title
    || result.horizontalScrollReach > 2
    || result.brokenImages.length
    || result.imagesWithoutAlt.length
    || result.mojibake
    || !result.mainScriptLoaded
    || result.forms.some((form) => (
      form.unnamed
      || form.submitButtons !== 1
      || !form.consent
      || !form.consent.fits
    ))
    || (result.scenario === 'cookie_consent' && (
      !result.cookieConsent
      || result.cookieConsent.buttons !== 2
      || !result.cookieConsent.fitsViewport
    ))
  );
  console.log(JSON.stringify({ audited: results.length, failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} finally {
  chrome.kill();
  await delay(500);
  try {
    await rm(profileDirectory, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 });
  } catch (error) {
    console.warn(`Temporary Chrome profile could not be removed: ${error.code || error.message}`);
  }
}
