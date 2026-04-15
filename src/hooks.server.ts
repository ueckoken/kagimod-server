import { getDB } from '$lib/server/database';
import type { ServerInit, Handle } from '@sveltejs/kit';

export const init: ServerInit = async () => {
  getDB();
};

export const handle: Handle = async ({ event, resolve }) => {
  const auth = event.request.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '');

  if (token) {
    console.log(token.split('.')[1]);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    event.locals.user = payload;
  }

  return await resolve(event);
};

process.on('exit', () => getDB().close());
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
