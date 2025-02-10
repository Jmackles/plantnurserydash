import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const startTime = Date.now();
    const response = NextResponse.next();
    
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    
    if (request.url.includes('/api/customers')) {
        console.log(`${request.method} ${request.url} - ${Date.now() - startTime}ms`);
    }
    
    return response;
}

export const config = {
    matcher: '/api/:path*',
};
