
import 'dotenv/config'; // Load env vars
import { createServer } from 'node:http';
// @ts-ignore
import handler from '../api/analyze.ts';

const PORT = 3005;

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

            // Start building the mock response object (that acts like VercelResponse)
            const mockRes = {
                statusCode: 200,
                headers: {} as Record<string, string | string[]>,
                setHeader(k: string, v: string) { this.headers[k] = v; },
                status(code: number) { this.statusCode = code; return this; },
                send(body: any) {
                    res.statusCode = this.statusCode;
                    Object.entries(this.headers).forEach(([k, v]) => res.setHeader(k, v));
                    res.end(typeof body === 'object' ? JSON.stringify(body) : body);
                },
                json(body: any) { this.send(body); }
            };

            // Enhance req with .body (which we parsed)
            // @ts-ignore
            req.body = JSON.parse(body || '{}');

            // Call handler directly with (req, res)
            await handler(req, mockRes);

        } catch (e: any) {
            console.error("[LocalAPI] Error:", e);
            try { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); } catch (err) { }
        }
        return;
    }

    res.statusCode = 404;
    res.end(`Not Found: ${req.url}`);
});

server.listen(PORT, () => {
    console.log(`> Local API Server running at http://localhost:${PORT}`);
});
