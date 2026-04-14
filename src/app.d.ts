// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: {
        sub: string;
        name: string;
        preferred_username: string;
        email: string;
        email_verified: boolean;
        picture: string;
        roles: string[];
        iad: number;
        iss: string;
        aud: string;
        exp: number;
      };
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
