import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function socketMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle WebSocket upgrade requests
  if (pathname.startsWith('/api/socket')) {
    const upgradeHeader = request.headers.get('upgrade');
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      return NextResponse.next();
    }
    return new Response('Expected Upgrade: WebSocket', { status: 426 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/socket',
};
