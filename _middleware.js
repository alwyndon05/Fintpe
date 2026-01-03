// Cloudflare Pages Middleware - Password Protection

const COOKIE_NAME = 'rate_chart_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // Skip auth for API callback (needed for OAuth flow)
    if (url.pathname.startsWith('/api/kite-callback')) {
        return next();
    }

    // Check if password protection is enabled
    const APP_PASSWORD = env.APP_PASSWORD;
    if (!APP_PASSWORD) {
        // No password set, allow access
        return next();
    }

    // Check for valid auth cookie
    const cookies = request.headers.get('Cookie') || '';
    const authCookie = cookies.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (authCookie) {
        const token = authCookie.split('=')[1];
        // Simple hash check
        const expectedToken = await hashPassword(APP_PASSWORD);
        if (token === expectedToken) {
            return next();
        }
    }

    // Check if this is a login attempt
    if (request.method === 'POST' && url.pathname === '/login') {
        const formData = await request.formData();
        const password = formData.get('password');

        if (password === APP_PASSWORD) {
            const token = await hashPassword(APP_PASSWORD);
            const response = new Response(null, {
                status: 302,
                headers: {
                    'Location': '/',
                    'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`
                }
            });
            return response;
        } else {
            return loginPage('Invalid password. Please try again.', env);
        }
    }

    // Show login page
    if (url.pathname !== '/login') {
        return loginPage('', env);
    }

    return loginPage('', env);
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'rate_chart_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loginPage(error, env) {
    const appName = env.APP_NAME || 'Rate Chart';
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - ${appName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            width: 100%;
            max-width: 400px;
        }
        h1 {
            font-size: 24px;
            color: #1a1a2e;
            margin-bottom: 8px;
            text-align: center;
        }
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group { margin-bottom: 20px; }
        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
        }
        input[type="password"] {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .error {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
        .icon {
            text-align: center;
            font-size: 48px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="icon">📊</div>
        <h1>${appName}</h1>
        <p class="subtitle">Enter password to access the dashboard</p>
        ${error ? `<div class="error">${error}</div>` : ''}
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required autofocus>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>
    `, {
        status: 401,
        headers: { 'Content-Type': 'text/html' }
    });
}
