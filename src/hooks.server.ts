import db from '$lib/server/database';
import type { ServerInit, Handle } from '@sveltejs/kit';

export const init: ServerInit = async () => {
  console.log(db);
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
