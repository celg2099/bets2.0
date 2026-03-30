const BROWSER_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
  'Origin': 'https://www.livescore.com',
  'Referer': 'https://www.livescore.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

export default {
  '/v1/api': {
    target: 'https://prod-public-api.livescore.com',
    changeOrigin: true,
    secure: false,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        Object.entries(BROWSER_HEADERS).forEach(([key, value]) => {
          proxyReq.setHeader(key, value);
        });
      });
    },
  },
  '/en/football': {
    target: 'https://www.livescore.com',
    changeOrigin: true,
    secure: false,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        Object.entries(BROWSER_HEADERS).forEach(([key, value]) => {
          proxyReq.setHeader(key, value);
        });
      });
    },
  },
};
