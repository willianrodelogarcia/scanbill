interface LogoutContext {
  cookies: { delete: (name: string, options?: { path?: string }) => void };
  redirect: (path: string) => any;
}

export const GET = async ({ cookies, redirect }: LogoutContext) => {
  cookies.delete('token', { path: '/' });
  return redirect('/');
};