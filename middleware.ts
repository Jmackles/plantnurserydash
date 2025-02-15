import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Allow static chunks to load
    if (request.nextUrl.pathname.startsWith('/_next/')) {
        return NextResponse.next();
    }

    const startTime = Date.now();
    const response = NextResponse.next();
    
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    
    // Log API requests
    if (request.url.includes('/api/')) {
        console.log(`${request.method} ${request.url} - ${Date.now() - startTime}ms`);
    }
    
    return response;
}

export const config = {
    matcher: [
        // Match API routes
        '/api/:path*',
        // Match static files
        '/_next/static/:path*',
        // Match all pages
        '/:path*'
    ],
};
