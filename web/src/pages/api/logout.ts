interface LogoutContext {
  cookies: { delete: (name: string, options?: { path?: string }) => void };
  redirect: (path: string) => any;
}

export const POST = async ({ cookies, redirect }: LogoutContext) => {
  cookies.delete('token', { path: '/' });
  return redirect('/login');
};