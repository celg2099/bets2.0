module.exports = {
  '/sofascore-api': {
    target: 'https://www.sofascore.com',
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/sofascore-api': '/api/v1' },
    configure: function (proxy) {
      proxy.on('proxyReq', function (proxyReq) {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9,es;q=0.8');
        proxyReq.setHeader('Origin', 'https://www.sofascore.com');
        proxyReq.setHeader('Referer', 'https://www.sofascore.com/');
        proxyReq.setHeader('Cache-Control', 'no-cache');
      });
    },
  },
  '/v1/api': {
    target: 'https://prod-public-api.livescore.com',
    changeOrigin: true,
    secure: false,
    configure: function (proxy) {
      proxy.on('proxyReq', function (proxyReq) {
        proxyReq.setHeader(
          'User-Agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        );
        proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9,es;q=0.8');
        proxyReq.setHeader('Origin', 'https://www.livescore.com');
        proxyReq.setHeader('Referer', 'https://www.livescore.com/');
        proxyReq.setHeader('Cache-Control', 'no-cache');
      });
    },
  },
  '/en/football': {
    target: 'https://www.livescore.com',
    changeOrigin: true,
    secure: false,
    configure: function (proxy) {
      proxy.on('proxyReq', function (proxyReq) {
        proxyReq.setHeader(
          'User-Agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        );
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9,es;q=0.8');
        proxyReq.setHeader('Referer', 'https://www.livescore.com/');
      });
    },
  },
};
