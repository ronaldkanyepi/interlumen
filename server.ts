import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { getRequestListener } from '@hono/node-server';
import { app as voiceApp, injectWebSocket } from './voice-agent/index';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    // Convert Hono app to Node.js request listener
    const honoListener = getRequestListener(voiceApp.fetch);

    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            const { pathname } = parsedUrl;

            // Route /voice/* requests to Hono Voice Agent
            if (pathname?.startsWith('/voice')) {
                return honoListener(req, res);
            }

            // Let Next.js handle everything else (pages, public assets, etc.)
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    // Attach WebSocket handler (handles /ws upgrades)
    injectWebSocket(server);

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
        console.log(`> Voice Agent ready at /voice/* and /ws`);
    });
});
