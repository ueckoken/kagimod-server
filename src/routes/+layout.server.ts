import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  let user;

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

  return { user };
};
