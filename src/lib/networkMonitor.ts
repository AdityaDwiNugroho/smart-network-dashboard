import snmp from 'net-snmp';
import SSH from './ssh';
import { redis } from './redis';
import { getInfluxDB } from './influxdb';
import { Device, NetworkMetrics, RouterConfig } from '@/types';
import { WebSocketServer } from './socket';

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private snmpSession: any;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.setupSNMP();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private setupSNMP() {
    const options = {
      version: snmp.Version2c,
      community: process.env.ROUTER_SNMP_COMMUNITY || 'public',
    };

    this.snmpSession = snmp.createSession(
      process.env.ROUTER_IP || '192.168.1.1',
      options
    );
  }

  async startMonitoring() {
    if (this.pollInterval) return;

    this.pollInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 30000); // Poll every 30 seconds
  }

  stopMonitoring() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async collectMetrics() {
    // SNMP OIDs for network interfaces
    const oids = {
      ifInOctets: '1.3.6.1.2.1.2.2.1.10',
      ifOutOctets: '1.3.6.1.2.1.2.2.1.16',
      ifOperStatus: '1.3.6.1.2.1.2.2.1.8',
    };

    // Collect SNMP data
    const metrics = await this.getSNMPMetrics(Object.values(oids));

    // Calculate bandwidth and store in InfluxDB
    const influxdb = getInfluxDB();
    await influxdb.writePoints([
      {
        measurement: 'network_metrics',
        tags: {
          device_id: process.env.ROUTER_IP || '192.168.1.1'
        },
        fields: {
          bandwidth_in: metrics.ifInOctets,
          bandwidth_out: metrics.ifOutOctets
        },
        timestamp: new Date()
      }
    ]);

    // Cache the latest metrics in Redis
    await redis.hset(
      'latest_metrics',
      'bandwidth',
      JSON.stringify({
        in: metrics.ifInOctets,
        out: metrics.ifOutOctets,
      })
    );

    // Emit real-time update
    WebSocketServer.emitMetrics(metrics);
  }

  private getSNMPMetrics(oids: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.snmpSession.get(oids, (error: Error, varbinds: any[]) => {
        if (error) {
          reject(error);
          return;
        }

        const metrics = varbinds.reduce((acc: any, varbind: any) => {
          if (snmp.isVarbindError(varbind)) {
            console.error('SNMP Error:', snmp.varbindError(varbind));
            return acc;
          }
          acc[varbind.oid] = varbind.value;
          return acc;
        }, {});

        resolve(metrics);
      });
    });
  }

  async getRouterStatus(): Promise<RouterConfig> {
    try {
      const ssh = new SSH({
        host: process.env.ROUTER_IP || '192.168.1.1',
        username: process.env.ROUTER_SSH_USER || 'root',
        password: process.env.ROUTER_SSH_PASSWORD || '',
      });

      const uptime = await ssh.execute('uptime');
      const memory = await ssh.execute('free -m');
      const load = await ssh.execute('cat /proc/loadavg');

      // SSH connection is automatically closed by the execute method

      return {
        id: process.env.ROUTER_IP || '192.168.1.1',
        name: 'Main Router',
        ipAddress: process.env.ROUTER_IP || '192.168.1.1',
        sshConfig: {
          username: process.env.ROUTER_SSH_USER || 'root',
        },
        snmpConfig: {
          community: process.env.ROUTER_SNMP_COMMUNITY || 'public',
          version: process.env.ROUTER_SNMP_VERSION as '1' | '2c' | '3' || '2c',
          port: 161,
        },
      };
    } catch (error) {
      console.error('Error getting router status:', error);
      throw error;
    }
  }
}
