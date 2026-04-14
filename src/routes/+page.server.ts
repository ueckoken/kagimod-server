import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (import.meta.env.DEV) {
    return {
      user: {
        sub: 'dummyid',
        name: 'Dummy User',
        preferred_username: 'dummyuser',
        picture: 'https://github.com/ueckoken.png',
        roles: [],
      },
    };
  }
  return { user: locals.user };
};
