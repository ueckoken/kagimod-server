import { getDB } from '$lib/server/database';
import { login } from '$lib/server/discord';
import { startSSEServer } from '$lib/server/sse';
import type { ServerInit, Handle } from '@sveltejs/kit';

export const init: ServerInit = async () => {
  await login();
  startSSEServer();
};

export const handle: Handle = async ({ event, resolve }) => {
  const auth = event.request.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '');

  if (token) {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    event.locals.user = payload;
  }

  const param = event.url.pathname.slice(1);
  if (RegExp(/^[a-fA-F0-9]{16}$/).test(param)) {
    event.url.pathname = '/';
    return await event.fetch(event.url.toString());
  }

  return await resolve(event);
};

process.on('exit', () => getDB().close());
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
