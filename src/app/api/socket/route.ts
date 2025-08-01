import { WebSocketServer } from '@/lib/socket';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected Websocket connection', { status: 400 });
  }

  try {
    const { response, socket } = await WebSocketServer.init(req);
    return response;
  } catch (err) {
    console.error('WebSocket initialization error:', err);
    return new Response('Failed to upgrade connection', { status: 500 });
  }
}
