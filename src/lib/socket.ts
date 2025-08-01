import { WebSocket, WebSocketServer as WSServer } from 'ws';
import { Device, NetworkMetrics } from '@/types';
import { NextRequest } from 'next/server';

interface WebSocketMessage {
  type: 'metrics_update' | 'device_update';
  data: NetworkMetrics | Device;
}

class WebSocketHandler {
  private static instance: WebSocketHandler | null = null;
  private wss: WSServer | null = null;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  static getInstance(): WebSocketHandler {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler();
    }
    return WebSocketHandler.instance;
  }

  async init(request: NextRequest): Promise<{ socket: WebSocket; response: Response }> {
    if (!this.wss) {
      this.wss = new WSServer({ noServer: true });

      this.wss.on('connection', (ws: WebSocket) => {
        console.log('Client connected');
        this.clients.add(ws);

        ws.on('message', (message: Buffer) => {
          try {
            const data = JSON.parse(message.toString()) as WebSocketMessage;
            this.handleMessage(ws, data);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        });

        ws.on('close', () => {
          console.log('Client disconnected');
          this.clients.delete(ws);
        });
      });
    }

    const { socket, response } = await this.upgradeConnection(request);
    
    if (!socket) {
      throw new Error('Failed to upgrade WebSocket connection');
    }

    return { socket, response };
  }

  private async upgradeConnection(request: NextRequest) {
    // @ts-ignore - Next.js internal API
    const upgrade = await request.socket.server.upgrade(request);
    return upgrade;
  }

  emitMetrics(metrics: NetworkMetrics) {
    this.broadcast({
      type: 'metrics_update',
      data: metrics
    });
  }

  emitDevice(device: Device) {
    this.broadcast({
      type: 'device_update',
      data: device
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'metrics_update':
        this.broadcast(message);
        break;
      case 'device_update':
        this.broadcast(message);
        break;
      default:
        console.warn('Unknown message type:', message);
    }
  }

  private broadcast(message: WebSocketMessage) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export const WebSocketServer = WebSocketHandler.getInstance();
