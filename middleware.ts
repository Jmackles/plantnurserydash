import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    console.log('Middleware intercepted request:', request.url);
    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
