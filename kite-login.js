// Cloudflare Function to redirect to Kite Connect login

export async function onRequestGet(context) {
    const { request } = context;
    const url = new URL(request.url);

    const apiKey = url.searchParams.get('api_key');

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'api_key is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;

    return Response.redirect(loginUrl, 302);
}
