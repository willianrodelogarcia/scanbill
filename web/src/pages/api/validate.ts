export const GET = async ({ request }: { request: Request }) => {
  const apiUrl = import.meta.env.PUBLIC_API_URL;
  const cookie = request.headers.get('cookie');

  const headers: HeadersInit = {};
  if (cookie) {
    headers['cookie'] = cookie; // reenvía la cookie tal como viene del navegador
  }

  const res = await fetch(`${apiUrl}/api/login/validate`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await res.json();
  return new Response(JSON.stringify({ valid: true, user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};