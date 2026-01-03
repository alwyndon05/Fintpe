/**
 * Rate Chart Server with Kite Connect WebSocket
 *
 * This server:
 * 1. Serves the Rate Chart HTML page
 * 2. Handles Kite Connect OAuth login flow
 * 3. Proxies REST API requests to Kite Connect
 * 4. Connects to Kite WebSocket for real-time streaming
 * 5. Broadcasts real-time data to browser clients
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Try to load WebSocket library
let WebSocket;
try {
    WebSocket = require('ws');
} catch (e) {
    console.log('WebSocket library not found. Installing...');
    require('child_process').execSync('npm install ws', { stdio: 'inherit' });
    WebSocket = require('ws');
}

const PORT = 3001;
const KITE_API_BASE = 'api.kite.trade';
const KITE_WS_URL = 'wss://ws.kite.trade';
const HTML_FILE = path.join(__dirname, 'index.html');

// Kite Connect credentials
let KITE_API_KEY = '';
let KITE_API_SECRET = '';
let KITE_ACCESS_TOKEN = '';

// WebSocket connections
let kiteWs = null;
let browserClients = new Set();

// Instrument tokens for indices
const INSTRUMENT_TOKENS = {
    256265: { symbol: 'NIFTY 50', name: 'NSE Nifty Fifty', icon: '📊' },
    260105: { symbol: 'BANK NIFTY', name: 'Nifty Bank Index', icon: '🏦' },
    259849: { symbol: 'NIFTY IT', name: 'Nifty IT Index', icon: '💻' },
    // Note: SENSEX is on BSE, might need different handling
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kite-Version');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve HTML page
    if (pathname === '/' || pathname === '/index.html') {
        fs.readFile(HTML_FILE, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Kite OAuth callback
    if (pathname === '/kite-callback') {
        const requestToken = parsedUrl.query.request_token;
        const apiKey = parsedUrl.query.api_key || KITE_API_KEY;
        const apiSecret = parsedUrl.query.api_secret || KITE_API_SECRET;

        if (!requestToken) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Error: No request_token</h1>');
            return;
        }

        console.log(`[${time()}] Generating access_token...`);

        try {
            const accessToken = await generateAccessToken(apiKey, apiSecret, requestToken);
            KITE_API_KEY = apiKey;
            KITE_API_SECRET = apiSecret;
            KITE_ACCESS_TOKEN = accessToken;

            console.log(`[${time()}] ✅ Access token generated!`);

            // Connect to Kite WebSocket
            connectToKiteWebSocket();

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
<!DOCTYPE html>
<html>
<head><title>Login Successful</title>
<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f0f0}.card{background:#fff;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1);text-align:center}h1{color:#10b981}</style>
</head>
<body>
<div class="card">
    <h1>✅ Login Successful!</h1>
    <p>WebSocket streaming connected.</p>
    <p>Redirecting...</p>
</div>
<script>
localStorage.setItem('rateChartSettings', JSON.stringify({
    kiteApiKey: '${apiKey}',
    kiteAccessToken: '${accessToken}',
    proxyUrl: 'http://localhost:${PORT}'
}));
setTimeout(() => window.location.href = '/', 1500);
</script>
</body>
</html>`);
        } catch (error) {
            console.error('Token generation failed:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<h1>❌ Login Failed</h1><p>${error.message}</p><a href="/">Try again</a>`);
        }
        return;
    }

    // Kite login redirect
    if (pathname === '/kite-login') {
        const apiKey = parsedUrl.query.api_key;
        const apiSecret = parsedUrl.query.api_secret;
        if (apiKey) KITE_API_KEY = apiKey;
        if (apiSecret) KITE_API_SECRET = apiSecret;

        const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;
        res.writeHead(302, { 'Location': loginUrl });
        res.end();
        return;
    }

    // WebSocket status
    if (pathname === '/ws-status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            kiteConnected: kiteWs && kiteWs.readyState === WebSocket.OPEN,
            browserClients: browserClients.size,
            hasToken: !!KITE_ACCESS_TOKEN
        }));
        return;
    }

    // Proxy Kite API requests
    if (pathname.startsWith('/quote') || pathname.startsWith('/instruments') || pathname.startsWith('/ohlc')) {
        let authHeader = req.headers['authorization'];
        if (KITE_ACCESS_TOKEN && KITE_API_KEY) {
            authHeader = `token ${KITE_API_KEY}:${KITE_ACCESS_TOKEN}`;
        }

        console.log(`[${time()}] PROXY: ${pathname}`);

        const options = {
            hostname: KITE_API_BASE,
            port: 443,
            path: parsedUrl.path,
            method: req.method,
            headers: {
                'X-Kite-Version': '3',
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            // Log response for debugging (only for first few requests)
            let responseBody = '';
            proxyRes.on('data', chunk => {
                responseBody += chunk;
            });
            proxyRes.on('end', () => {
                try {
                    const json = JSON.parse(responseBody);
                    // Log first stock's data structure
                    if (json.data) {
                        const firstKey = Object.keys(json.data)[0];
                        if (firstKey && firstKey.includes(':')) {
                            console.log(`[${time()}] 📊 Sample quote for ${firstKey}:`, JSON.stringify(json.data[firstKey], null, 2));
                        }
                    }
                } catch (e) {}
            });

            proxyRes.pipe(res, { end: false });
            proxyRes.on('end', () => res.end());
        });

        proxyReq.on('error', (error) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });

        req.pipe(proxyReq);
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

// Create WebSocket server for browser clients
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log(`[${time()}] 🌐 Browser connected (total: ${browserClients.size + 1})`);
    browserClients.add(ws);

    ws.on('close', () => {
        browserClients.delete(ws);
        console.log(`[${time()}] 🌐 Browser disconnected (total: ${browserClients.size})`);
    });

    ws.on('error', (err) => {
        console.error('Browser WS error:', err.message);
        browserClients.delete(ws);
    });

    // Send current connection status
    ws.send(JSON.stringify({
        type: 'status',
        kiteConnected: kiteWs && kiteWs.readyState === WebSocket.OPEN
    }));
});

// Connect to Kite WebSocket
function connectToKiteWebSocket() {
    if (!KITE_API_KEY || !KITE_ACCESS_TOKEN) {
        console.log(`[${time()}] ⚠️ Cannot connect to Kite WS: No credentials`);
        return;
    }

    if (kiteWs && kiteWs.readyState === WebSocket.OPEN) {
        console.log(`[${time()}] Kite WS already connected`);
        return;
    }

    const wsUrl = `${KITE_WS_URL}?api_key=${KITE_API_KEY}&access_token=${KITE_ACCESS_TOKEN}`;
    console.log(`[${time()}] 📡 Connecting to Kite WebSocket...`);

    kiteWs = new WebSocket(wsUrl);

    kiteWs.on('open', () => {
        console.log(`[${time()}] ✅ Kite WebSocket connected!`);

        // Subscribe to instruments in "quote" mode
        const tokens = Object.keys(INSTRUMENT_TOKENS).map(Number);

        // Subscribe
        kiteWs.send(JSON.stringify({ a: 'subscribe', v: tokens }));
        console.log(`[${time()}] 📊 Subscribed to ${tokens.length} instruments`);

        // Set mode to quote (includes OHLC)
        kiteWs.send(JSON.stringify({ a: 'mode', v: ['quote', tokens] }));

        // Notify browser clients
        broadcast({ type: 'status', kiteConnected: true });
    });

    kiteWs.on('message', (data) => {
        // Kite sends binary data
        if (Buffer.isBuffer(data)) {
            console.log(`[${time()}] 📨 Received ${data.length} bytes from Kite`);
            const parsed = parseKitePacket(data);
            if (parsed.length > 0) {
                console.log(`[${time()}] 📊 Parsed ${parsed.length} ticks:`, parsed.map(t => `${t.symbol}: ${t.ltp} (${t.change >= 0 ? '+' : ''}${t.change?.toFixed(2)})`).join(', '));
                broadcast({ type: 'tick', data: parsed });
            }
        } else {
            console.log(`[${time()}] 📨 Received non-binary message:`, data.toString().substring(0, 100));
        }
    });

    kiteWs.on('close', () => {
        console.log(`[${time()}] ❌ Kite WebSocket disconnected`);
        broadcast({ type: 'status', kiteConnected: false });

        // Reconnect after 5 seconds
        setTimeout(() => {
            if (KITE_ACCESS_TOKEN) {
                console.log(`[${time()}] 🔄 Reconnecting...`);
                connectToKiteWebSocket();
            }
        }, 5000);
    });

    kiteWs.on('error', (err) => {
        console.error(`[${time()}] Kite WS error:`, err.message);
    });
}

// Parse Kite binary packet
function parseKitePacket(buffer) {
    const results = [];

    // First 2 bytes = number of packets
    if (buffer.length < 2) return results;

    const numPackets = buffer.readInt16BE(0);
    let offset = 2;

    for (let i = 0; i < numPackets && offset < buffer.length; i++) {
        // Each packet: 2 bytes length + payload
        if (offset + 2 > buffer.length) break;

        const packetLen = buffer.readInt16BE(offset);
        offset += 2;

        if (offset + packetLen > buffer.length) break;

        const packet = buffer.slice(offset, offset + packetLen);
        offset += packetLen;

        // Parse based on packet length
        if (packet.length >= 8) {
            const token = packet.readInt32BE(0);
            const instrumentInfo = INSTRUMENT_TOKENS[token];

            if (instrumentInfo) {
                const tick = {
                    token,
                    symbol: instrumentInfo.symbol,
                    name: instrumentInfo.name,
                    icon: instrumentInfo.icon,
                    ltp: packet.readInt32BE(4) / 100 // LTP in paise, convert to rupees
                };

                // Quote mode (44 bytes) has OHLC data
                if (packet.length >= 44) {
                    tick.lastQty = packet.readInt32BE(8);
                    tick.avgPrice = packet.readInt32BE(12) / 100;
                    tick.volume = packet.readInt32BE(16);
                    tick.buyQty = packet.readInt32BE(20);
                    tick.sellQty = packet.readInt32BE(24);
                    tick.open = packet.readInt32BE(28) / 100;
                    tick.high = packet.readInt32BE(32) / 100;
                    tick.low = packet.readInt32BE(36) / 100;
                    tick.close = packet.readInt32BE(40) / 100;

                    // Calculate change
                    tick.change = tick.ltp - tick.close;
                    tick.changePercent = tick.close ? ((tick.change / tick.close) * 100) : 0;
                }

                results.push(tick);
            }
        }
    }

    return results;
}

// Broadcast to all browser clients
function broadcast(message) {
    const data = JSON.stringify(message);
    browserClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Generate access token
function generateAccessToken(apiKey, apiSecret, requestToken) {
    return new Promise((resolve, reject) => {
        const checksum = crypto
            .createHash('sha256')
            .update(apiKey + requestToken + apiSecret)
            .digest('hex');

        const postData = `api_key=${apiKey}&request_token=${requestToken}&checksum=${checksum}`;

        const options = {
            hostname: KITE_API_BASE,
            port: 443,
            path: '/session/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'X-Kite-Version': '3'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'success' && json.data?.access_token) {
                        resolve(json.data.access_token);
                    } else {
                        reject(new Error(json.message || 'Failed to get token'));
                    }
                } catch (e) {
                    reject(new Error('Invalid response'));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function time() {
    return new Date().toLocaleTimeString();
}

// Start server
server.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          Rate Chart Server with WebSocket                  ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  HTTP:      http://localhost:${PORT}                          ║`);
    console.log(`║  WebSocket: ws://localhost:${PORT}                            ║`);
    console.log('║                                                            ║');
    console.log('║  Features:                                                 ║');
    console.log('║  • Rate Chart page                                         ║');
    console.log('║  • Kite OAuth login                                        ║');
    console.log('║  • REST API proxy                                          ║');
    console.log('║  • Real-time WebSocket streaming                           ║');
    console.log('║                                                            ║');
    console.log('║  Press Ctrl+C to stop.                                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
});
