import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';



// proxy.ts
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public routes: do NOT run auth0.middleware, do NOT touch body
  if (
    pathname === '/' ||               // marketing page
    pathname.startsWith('/public') || // other public pages
    pathname === '/api/upload'        // upload route needs raw body
  ) {
    return NextResponse.next();
  }

  // 2. Auth routes handled by Auth0
  if (pathname.startsWith('/auth')) {
    return auth0.middleware(request);
  }

  // 3. Everything else: require session
  const authRes = await auth0.middleware(request);

  // Do not pass the request and let the package handle getting the cookies
  const session = await auth0.getSession();

  if (!session) {
    // user is not authenticated, redirect to login page
    return NextResponse.redirect(
      new URL('/auth/login', request.nextUrl.origin),
    );
  }

  // the headers from the auth middleware should always be returned
  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/upload).*)',
  ],
};
