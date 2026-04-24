import { getDB } from '$lib/server/database';
import { sendLog } from '$lib/server/discord';

const clients: Set<ReadableStreamDefaultController> = new Set();

export function startSSEServer() {
  Bun.serve({
    port: 3001,
    routes: {
      '/events': (req, server) => {
        server.timeout(req, 0);

        let controller: ReadableStreamDefaultController;

        const stream = new ReadableStream({
          start(c) {
            controller = c;
            clients.add(controller);
            const idmHashList = getDB().query('SELECT cards.idm_hash FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1').all().map(a => (a as { idm_hash: string }).idm_hash);
            controller.enqueue(`data: ${idmHashList}\n\n`);
          },
          cancel() {
            clients.delete(controller);
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });
      },
      '/open': {
        async POST(req) {
          await sendLog(true, await req.text());
          return Response.json({ success: true });
        },
      },
      '/close': {
        async POST(req) {
          await sendLog(false, await req.text());
          return Response.json({ success: true });
        },
      },
    },
  });
}

export function updateEvent() {
  const idmHashList = getDB().query('SELECT cards.idm_hash FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1').all().map(a => (a as { idm_hash: string }).idm_hash);
  for (const controller of clients) {
    controller.enqueue(`event: update\ndata: ${idmHashList}\n\n`);
  }
}

export function addEvent(idm_hash: string) {
  const card = getDB().query('SELECT cards.idm_hash FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1 AND cards.idm_hash = ?').get(idm_hash) as { idm_hash: string };
  if (card) {
    for (const controller of clients) {
      controller.enqueue(`event: add\ndata: ${card.idm_hash}\n\n`);
    }
  }
}

export function deleteEvent(idm_hash: string) {
  for (const controller of clients) {
    controller.enqueue(`event: delete\ndata: ${idm_hash}\n\n`);
  }
}
