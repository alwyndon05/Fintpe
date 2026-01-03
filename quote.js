// Cloudflare Function to proxy Kite Connect /quote API

export async function onRequestGet(context) {
    const { request } = context;
    const url = new URL(request.url);

    // Get query parameters (instrument symbols)
    const symbols = url.searchParams.getAll('i');
    if (symbols.length === 0) {
        return new Response(JSON.stringify({ error: 'No symbols provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get authorization from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization header required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Build Kite API URL
    const kiteUrl = `https://api.kite.trade/quote?${symbols.map(s => `i=${encodeURIComponent(s)}`).join('&')}`;

    try {
        const response = await fetch(kiteUrl, {
            method: 'GET',
            headers: {
                'X-Kite-Version': '3',
                'Authorization': authHeader
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Authorization, X-Kite-Version, Content-Type'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, X-Kite-Version, Content-Type'
        }
    });
}
