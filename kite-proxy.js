/**
 * Kite Connect Proxy Server
 *
 * This simple proxy server forwards requests to the Kite Connect API
 * and adds the required CORS headers so the browser can access it.
 *
 * Usage:
 *   1. Make sure Node.js is installed
 *   2. Run: node kite-proxy.js
 *   3. The proxy will start on http://localhost:3001
 *   4. Configure the proxy URL in your Rate Chart settings
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const KITE_API_BASE = 'api.kite.trade';

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kite-Version');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse the incoming URL
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.path;

    // Log the request
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${path}`);

    // Forward to Kite API
    const options = {
        hostname: KITE_API_BASE,
        port: 443,
        path: path,
        method: req.method,
        headers: {
            'X-Kite-Version': req.headers['x-kite-version'] || '3',
            'Authorization': req.headers['authorization'] || '',
            'Content-Type': 'application/json'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Forward status and headers
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });

        // Forward response body
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
        console.error('Proxy error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    });

    // Forward request body if any
    req.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║       Kite Connect Proxy Server Running           ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log(`║  URL: http://localhost:${PORT}                        ║`);
    console.log('║                                                   ║');
    console.log('║  This proxy forwards requests to Kite API        ║');
    console.log('║  and handles CORS for browser access.            ║');
    console.log('║                                                   ║');
    console.log('║  Press Ctrl+C to stop the server.                ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('');
    console.log('Waiting for requests...');
    console.log('');
});
