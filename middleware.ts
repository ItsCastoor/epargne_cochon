import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  console.log(`[Middleware] Path: ${pathname}, Token: ${token ? 'Présent' : 'Absent'}`);

  const isAuthPage = pathname.startsWith('/auth');
  const isPublicPage = pathname === '/' || isAuthPage;

  // Si pas de token ET pas sur une page publique (auth ou root)
  if (!token && !isPublicPage) {
    console.log(`[Middleware] Redirection vers login depuis ${pathname}`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Si token ET on est sur login/register, rediriger vers dashboard
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    console.log(`[Middleware] Redirection vers dashboard depuis ${pathname}`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si on est à la racine et pas de token, rediriger vers login
  if (pathname === '/' && !token) {
    console.log('[Middleware] Redirection root vers login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

