// Vercel Serverless Function — proxy para Sofascore API
// Captura cualquier subpath: /api/sofascore/unique-tournament/123/seasons, etc.

const SOFASCORE_BASE = 'https://www.sofascore.com/api/v1';

const SOFASCORE_HEADERS = {
  'Origin': 'https://www.sofascore.com',
  'Referer': 'https://www.sofascore.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }

  // Construir URL destino con query string original
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const queryParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(req.query).filter(([k]) => k !== 'path')
    )
  ).toString();
  const targetUrl = `${SOFASCORE_BASE}/${segments.join('/')}${queryParams ? `?${queryParams}` : ''}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: SOFASCORE_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    const body = await upstream.text();

    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(body);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? 'Sofascore proxy timeout' : 'Sofascore proxy error',
      detail: String(err),
    });
  }
};
