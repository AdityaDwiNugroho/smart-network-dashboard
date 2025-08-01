import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import SSH from './ssh';
import { SNMPService } from '@/services/snmp';

export interface MetricsData {
  timestamp: Date;
  system: {
    uptime: string;
    load: string;
    memory: {
      total: number;
      free: number;
      used: number;
      percentage: number;
    };
  };
  network: {
    interfaces: number;
    connectedDevices: number;
    totalRx: number;
    totalTx: number;
  };
  wifi: {
    radios: number;
    clients: number;
  };
  devices: any[];
}

class RealTimeMonitor {
  private static instance: RealTimeMonitor;
  private wss: WebSocketServer | null = null;
  private server: any = null;
  private clients: Set<WebSocket> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  private constructor() {}

  static getInstance(): RealTimeMonitor {
    if (!RealTimeMonitor.instance) {
      RealTimeMonitor.instance = new RealTimeMonitor();
    }
    return RealTimeMonitor.instance;
  }

  async start(port: number = 3001): Promise<void> {
    if (this.wss) {
      console.log('WebSocket server already running');
      return;
    }

    try {
      // Create HTTP server for WebSocket
      this.server = createServer();
      this.wss = new WebSocketServer({ server: this.server });

      this.wss.on('connection', (ws: WebSocket) => {
        console.log('Client connected to real-time monitor');
        this.clients.add(ws);

        // Send current data immediately
        this.sendCurrentMetrics(ws);

        ws.on('message', (message: string) => {
          try {
            const data = JSON.parse(message);
            this.handleClientMessage(ws, data);
          } catch (error) {
            console.error('Invalid message from client:', error);
          }
        });

        ws.on('close', () => {
          console.log('Client disconnected from real-time monitor');
          this.clients.delete(ws);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.clients.delete(ws);
        });
      });

      this.server.listen(port, () => {
        console.log(`Real-time monitoring WebSocket server started on port ${port}`);
      });

      // Start monitoring
      this.startMonitoring();

    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  stop(): void {
    this.stopMonitoring();
    
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    if (this.server) {
      this.server.close();
      this.server = null;
    }

    this.clients.clear();
    console.log('Real-time monitoring stopped');
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('Starting real-time monitoring...');

    // Collect and broadcast metrics every 5 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.broadcast(metrics);
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 5000);
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Stopped real-time monitoring');
  }

  private async collectMetrics(): Promise<MetricsData> {
    try {
      const ssh = new SSH({
        host: process.env.ROUTER_IP || '192.168.1.1',
        username: process.env.ROUTER_SSH_USER || 'root',
        password: process.env.ROUTER_SSH_PASSWORD || '',
      });

      // Collect data in parallel for better performance
      const [systemInfo, networkInfo, wifiStatus, connectedDevices, interfaceStats] = await Promise.all([
        ssh.getSystemInfo(),
        ssh.getNetworkInterfaces(),
        ssh.getWifiStatus(),
        ssh.getConnectedDevices(),
        ssh.getInterfaceStatistics()
      ]);

      // Calculate total network traffic
      let totalRx = 0;
      let totalTx = 0;
      Object.values(interfaceStats).forEach((stats: any) => {
        totalRx += stats.rx_bytes || 0;
        totalTx += stats.tx_bytes || 0;
      });

      // Count WiFi clients
      let wifiClients = 0;
      Object.values(wifiStatus).forEach((radio: any) => {
        if (radio.interfaces) {
          radio.interfaces.forEach((iface: any) => {
            if (iface.clients) {
              wifiClients += Object.keys(iface.clients).length;
            }
          });
        }
      });

      const metrics: MetricsData = {
        timestamp: new Date(),
        system: {
          uptime: systemInfo.uptime,
          load: systemInfo.load,
          memory: {
            total: systemInfo.memory.total,
            free: systemInfo.memory.free,
            used: systemInfo.memory.used,
            percentage: ((systemInfo.memory.used / systemInfo.memory.total) * 100)
          }
        },
        network: {
          interfaces: networkInfo.interface?.length || 0,
          connectedDevices: connectedDevices.length,
          totalRx,
          totalTx
        },
        wifi: {
          radios: Object.keys(wifiStatus).length,
          clients: wifiClients
        },
        devices: connectedDevices.map(device => ({
          ...device,
          lastSeen: new Date(),
          signalStrength: this.getDeviceSignalStrength(device.macaddr, wifiStatus)
        }))
      };

      return metrics;

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      // Return fallback data
      return {
        timestamp: new Date(),
        system: {
          uptime: 'Unknown',
          load: 'Unknown',
          memory: { total: 0, free: 0, used: 0, percentage: 0 }
        },
        network: {
          interfaces: 0,
          connectedDevices: 0,
          totalRx: 0,
          totalTx: 0
        },
        wifi: {
          radios: 0,
          clients: 0
        },
        devices: []
      };
    }
  }

  private getDeviceSignalStrength(macAddress: string, wifiStatus: any): number | null {
    for (const radio of Object.values(wifiStatus)) {
      if (radio && typeof radio === 'object' && 'interfaces' in radio) {
        for (const iface of (radio as any).interfaces || []) {
          if (iface.clients && iface.clients[macAddress]) {
            return iface.clients[macAddress].signal || null;
          }
        }
      }
    }
    return null;
  }

  private async sendCurrentMetrics(ws: WebSocket): Promise<void> {
    try {
      const metrics = await this.collectMetrics();
      this.send(ws, metrics);
    } catch (error) {
      console.error('Failed to send current metrics:', error);
    }
  }

  private handleClientMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'subscribe':
        console.log('Client subscribed to real-time updates');
        break;
      case 'unsubscribe':
        console.log('Client unsubscribed from real-time updates');
        break;
      case 'ping':
        this.send(ws, { type: 'pong', timestamp: new Date() });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private broadcast(data: any): void {
    const message = JSON.stringify({
      type: 'metrics',
      data,
      timestamp: new Date()
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Failed to send to client:', error);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });
  }

  private send(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'metrics',
          data,
          timestamp: new Date()
        }));
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  isRunning(): boolean {
    return this.wss !== null && this.isMonitoring;
  }
}

export const realTimeMonitor = RealTimeMonitor.getInstance();
export default RealTimeMonitor;
