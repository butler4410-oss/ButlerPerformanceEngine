// Static server for the Sager Petroleum Solutions storefront on Railway.
// No dependencies. Serves the single-page prototype only; the spec, data and tools in this
// folder are never exposed. Search engines are blocked until ALLOW_INDEXING=true.
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const ALLOW_INDEXING = process.env.ALLOW_INDEXING === 'true';
// Origin the forms post to once CONFIG.formEndpoint is set in index.html (for example https://formspree.io).
const FORM_ORIGIN = process.env.FORM_ORIGIN || '';

function asset(body, type, cache) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8');
  return {
    buf,
    gz: zlib.gzipSync(buf, { level: 9 }),
    type,
    cache,
    etag: '"' + crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16) + '"',
  };
}

// index.html carries a prelaunch noindex tag so every copy (including GitHub Pages) stays out of search.
// Railway drops it once ALLOW_INDEXING=true.
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
if (ALLOW_INDEXING) html = html.replace(/<meta name="robots" content="noindex, nofollow">\n?/, '');
const page = asset(html, 'text/html; charset=utf-8', 'no-cache');
const ROUTES = {
  '/': page,
  '/index.html': page,
  '/robots.txt': asset(ALLOW_INDEXING ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n', 'text/plain; charset=utf-8', 'public, max-age=3600'),
  '/healthz': asset('ok\n', 'text/plain; charset=utf-8', 'no-store'),
};
// Clean paths people may type or share map onto the page's hash routes.
const HASH_ROUTES = /^\/(shop|product|ops|kits|bulk|about|contact|guides|faq|checkout|legal)(\/[\w.-]*)*\/?$/;

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self'" + (FORM_ORIGIN ? ' ' + FORM_ORIGIN : ''),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function baseHeaders() {
  const h = {
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000',
  };
  if (!ALLOW_INDEXING) h['X-Robots-Tag'] = 'noindex, nofollow';
  return h;
}

const server = http.createServer((req, res) => {
  const { pathname, search } = new URL(req.url, 'http://localhost');
  const headers = baseHeaders();

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...headers, Allow: 'GET, HEAD' });
    return res.end();
  }

  const a = ROUTES[pathname];
  if (!a) {
    if (HASH_ROUTES.test(pathname)) {
      res.writeHead(302, { ...headers, Location: '/#' + pathname.replace(/\/$/, '') + search });
      return res.end();
    }
    res.writeHead(404, { ...headers, 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><meta charset="utf-8"><title>Not found</title><p style="font-family:sans-serif;padding:24px">That page is not here. <a href="/">Go to Sager Petroleum Solutions</a></p>');
  }

  headers['Content-Type'] = a.type;
  headers['Cache-Control'] = a.cache;
  headers.ETag = a.etag;
  headers.Vary = 'Accept-Encoding';
  if (req.headers['if-none-match'] === a.etag) {
    res.writeHead(304, headers);
    return res.end();
  }
  const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const body = gzip ? a.gz : a.buf;
  if (gzip) headers['Content-Encoding'] = 'gzip';
  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sager Petroleum storefront on port ${PORT} (indexing ${ALLOW_INDEXING ? 'on' : 'off'})`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
