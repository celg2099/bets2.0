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

export default async function handler(req, res) {
  // req.query.path es un array con los segmentos del path capturados por [...path]
  const segments = req.query.path ?? [];
  const targetUrl = `${SOFASCORE_BASE}/${segments.join('/')}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: SOFASCORE_HEADERS,
    });

    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: 'Sofascore proxy error', detail: String(err) });
  }
}