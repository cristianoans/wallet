import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const jwt = request.cookies.get('jwt');

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

    if (!jwt && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (jwt && isAuthRoute) {
        return NextResponse.redirect(new URL('/transactions', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/transactions/:path*', '/login', '/register'],
};