// Cloudflare Function to handle Kite Connect OAuth callback
// API credentials are stored securely in Cloudflare environment variables

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const requestToken = url.searchParams.get('request_token');

    // Get API credentials from environment variables (secure, not exposed in URLs)
    const apiKey = env.KITE_API_KEY;
    const apiSecret = env.KITE_API_SECRET;

    if (!requestToken) {
        return errorPage('No request_token provided', 'The login request did not include a token.');
    }

    if (!apiKey || !apiSecret) {
        return errorPage(
            'API credentials not configured',
            'Please set KITE_API_KEY and KITE_API_SECRET in Cloudflare dashboard under Settings > Environment Variables.'
        );
    }

    try {
        // Generate checksum
        const encoder = new TextEncoder();
        const data = encoder.encode(apiKey + requestToken + apiSecret);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Exchange request token for access token
        const tokenResponse = await fetch('https://api.kite.trade/session/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Kite-Version': '3'
            },
            body: `api_key=${apiKey}&request_token=${requestToken}&checksum=${checksum}`
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.status !== 'success' || !tokenData.data?.access_token) {
            throw new Error(tokenData.message || 'Failed to get access token');
        }

        const accessToken = tokenData.data.access_token;

        // Return success page that stores credentials in localStorage
        return new Response(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Successful</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
            background: white;
            padding: 40px 60px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
        }
        h1 { color: #10b981; margin-bottom: 10px; }
        p { color: #666; margin: 10px 0; }
        .spinner {
            width: 24px;
            height: 24px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
            vertical-align: middle;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Login Successful!</h1>
        <p>Your Kite Connect session is active.</p>
        <p><span class="spinner"></span>Redirecting to Rate Chart...</p>
    </div>
    <script>
        // Store credentials in localStorage (API key from server, access token from login)
        const existingSettings = JSON.parse(localStorage.getItem('rateChartSettings') || '{}');
        localStorage.setItem('rateChartSettings', JSON.stringify({
            ...existingSettings,
            kiteApiKey: '${apiKey}',
            kiteAccessToken: '${accessToken}',
            proxyUrl: ''
        }));

        // Redirect to main page
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    </script>
</body>
</html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        return errorPage('Login Failed', error.message);
    }
}

function errorPage(title, message) {
    return new Response(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #ef4444; margin-bottom: 16px; }
        p { color: #666; margin: 10px 0; line-height: 1.5; }
        a {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
        }
        a:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="card">
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="/">Go Back</a>
    </div>
</body>
</html>
    `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
    });
}
