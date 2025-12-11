
import 'dotenv/config'; // Load env vars
import { createServer } from 'node:http';
// @ts-ignore
import handler from '../api/analyze.ts';

const PORT = 3003;

const server = createServer(async (req, res) => {
    // CORS Support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    console.log(`[LocalAPI] ${req.method} ${req.url}`);

    if (req.url === '/api/analyze' && req.method === 'POST') {
        try {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const body = Buffer.concat(buffers).toString();

            const webReq = new Request(`http://localhost:${PORT}${req.url}`, {
                method: 'POST',
                headers: req.headers as HeadersInit,
                body: body || '{}',
                // @ts-ignore
                duplex: 'half'
            });

            const webRes = await handler(webReq);

            res.statusCode = webRes.status;
            webRes.headers.forEach((v, k) => res.setHeader(k, v));
            const text = await webRes.text();
            res.end(text);

        } catch (e: any) {
            console.error("[LocalAPI] Error:", e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    res.statusCode = 404;
    res.end(`Not Found: ${req.url}`);
});

server.listen(PORT, () => {
    console.log(`> Local API Server running at http://localhost:${PORT}`);
});
