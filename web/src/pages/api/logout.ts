import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Elimina la cookie "token"
  cookies.delete('connect.sid', { path: '/' });

  // Redirige al inicio (puedes cambiarlo por '/login' si quieres)
  return redirect('/');
};