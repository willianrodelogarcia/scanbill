export const POST = async ({ request, redirect }: { request: Request; redirect: (url: string) => Response }) => {
  const api_url = import.meta.env.PUBLIC_API_URL;
  
  const form = await request.formData();
  const username = form.get('username')?.toString();
  const password = form.get('password')?.toString();
  

  const res = await fetch(`${api_url}/api/login`, {
    method: 'POST',
    credentials: 'include',
    body: form
  });
  

  if (res.ok) {
    return redirect('/dashboard');
  } else {
    return redirect('/login?error=1');
  }
};
