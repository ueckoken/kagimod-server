import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createHash } from 'crypto';
import { getDB } from '$lib/server/database';
import { addUser } from '$lib/server/discord';

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
    cards = db.query('SELECT * FROM cards WHERE user_id = ?').all(user.sub);
  }

  return { user, cards };
};

export const actions = {
  new: async ({ request, locals }) => {
    const data = await request.formData();
    const label = String(data.get('label'));
    const idm_raw = String(data.get('idm_raw')).toLowerCase();
    if (!label || !RegExp(/^[a-f0-9]{16}$/).test(idm_raw)) {
      return fail(400, 'Invalid form value');
    }

    const hash = createHash('sha256');
    hash.update(idm_raw);
    const idm_hash = hash.digest('hex').slice(0, 16);

    const user_id = import.meta.env.DEV ? 'dummyid' : locals.user?.sub || null;

    if (user_id) {
      await addUser(user_id);
    }

    const db = getDB();
    try {
      db.query('INSERT INTO cards (user_id, label, idm_raw, idm_hash) VALUES (?1, ?2, ?3, ?4)').run(user_id, label, idm_raw, idm_hash);
    } catch (e) {
      console.error(e);
      return fail(400, String(e));
    }

    return { success: true };
  },
  rename: async ({ request, locals }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    const label = String(data.get('label'));

    const user_id = import.meta.env.DEV ? 'dummyid' : locals.user?.sub || null;

    const db = getDB();
    try {
      db.query('UPDATE cards SET label = ?1 WHERE id == ?2 AND user_id == ?3').run(label, id, user_id);
    } catch (e) {
      console.error(e);
      return fail(400, String(e));
    }

    return { success: true };
  },
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));

    const user_id = import.meta.env.DEV ? 'dummyid' : locals.user?.sub || null;

    const db = getDB();
    try {
      db.query('DELETE from cards WHERE id == ?1 AND user_id == ?2').run(id, user_id);
    } catch (e) {
      console.error(e);
      return fail(400, String(e));
    }

    return { success: true };
  },
} satisfies Actions;
