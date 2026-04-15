import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/database';

export const load: PageServerLoad = async ({ locals }) => {
  let user;
  let cards;

  if (import.meta.env.DEV) {
    user = {
      sub: 'dummyid',
      name: 'Dummy User',
      preferred_username: 'dummyuser',
      picture: 'https://github.com/ueckoken.png',
      roles: [],
    };
  } else {
    user = locals.user;
  }

  if (user) {
    const db = getDB();
    cards = db.query('SELECT * FROM cards WHERE user_id = $userId').all({ $userId: user.sub });
  }

  return { user, cards };
};
