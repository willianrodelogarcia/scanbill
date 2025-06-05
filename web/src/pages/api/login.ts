import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect }) => {
  console.log(request.headers.get("Content-Type"))
  
  const form = await request.formData();
  const username = form.get('username')?.toString();
  const password = form.get('password')?.toString();
  

  const res = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  

  if (res.ok) {
    return redirect('/dashboard');
  } else {
    return redirect('/login?error=1');
  }
};
