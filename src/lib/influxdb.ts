// @ts-nocheck
import * as influx from 'influx';
const { InfluxDB, IPoint, FieldType } = influx as any;

// This module should only be used on the server side
let influxdb: InfluxDB | null = null;

export function getInfluxDB() {
  if (typeof window !== 'undefined') {
    throw new Error('InfluxDB should only be used on the server side');
  }
  
  if (!influxdb) {
    const { 
      INFLUXDB_URL, 
      INFLUXDB_DATABASE, 
      INFLUXDB_USERNAME, 
      INFLUXDB_PASSWORD 
    } = process.env;

    if (!INFLUXDB_URL || !INFLUXDB_DATABASE) {
      throw new Error('Missing InfluxDB configuration: INFLUXDB_URL and INFLUXDB_DATABASE are required');
    }

    const url = new URL(INFLUXDB_URL);
    influxdb = new InfluxDB({
      host: url.hostname,
      port: Number(url.port) || 8086,
      database: INFLUXDB_DATABASE,
      username: INFLUXDB_USERNAME,
      password: INFLUXDB_PASSWORD,
      schema: [
        {
          measurement: 'network_metrics',
          fields: {
            'bandwidth_in': FieldType.FLOAT,
            'bandwidth_out': FieldType.FLOAT,
            'latency': FieldType.FLOAT,
            'packet_loss': FieldType.FLOAT,
            'connection_count': FieldType.INTEGER
          },
          tags: ['device_id', 'interface']
        } as any,
        {
          measurement: 'device_metrics',
          fields: {
            'cpu_usage': FieldType.FLOAT,
            'memory_usage': FieldType.FLOAT,
            'temperature': FieldType.FLOAT,
            'uptime': FieldType.INTEGER
          },
          tags: ['device_id']
        } as any,
        {
          measurement: 'device_status',
          fields: {
            'online': FieldType.BOOLEAN,
            'signal_strength': FieldType.FLOAT,
            'last_seen': FieldType.INTEGER
          },
          tags: ['device_id', 'device_type']
        } as any
      ]
    });
  }
  
  return influxdb;
}

export interface NetworkMetrics {
  deviceId: string;
  interface: string;
  timestamp: Date;
  bandwidthIn: number;
  bandwidthOut: number;
  latency: number;
  packetLoss: number;
  connectionCount: number;
}

export interface DeviceMetrics {
  deviceId: string;
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  uptime: number;
}

export async function writeNetworkMetrics(metrics: NetworkMetrics): Promise<void> {
  const db = getInfluxDB();
  const point: IPoint = {
    measurement: 'network_metrics',
    tags: {
      device_id: metrics.deviceId,
      interface: metrics.interface
    },
    fields: {
      bandwidth_in: metrics.bandwidthIn,
      bandwidth_out: metrics.bandwidthOut,
      latency: metrics.latency,
      packet_loss: metrics.packetLoss,
      connection_count: metrics.connectionCount
    },
    timestamp: metrics.timestamp
  };

  try {
    await db.writePoints([point], {
      database: process.env.INFLUXDB_DATABASE,
      precision: 's'
    });
  } catch (error) {
    console.error('Error writing to InfluxDB:', error);
    throw error;
  }
}

export async function queryNetworkMetrics(deviceId: string, timeRange: string = '1h'): Promise<any[]> {
  const db = getInfluxDB();
  
  try {
    const result = await db.query(`
      SELECT 
        mean("bandwidth_in") as "bandwidthIn",
        mean("bandwidth_out") as "bandwidthOut",
        mean("latency") as "latency",
        mean("packet_loss") as "packetLoss",
        mean("connection_count") as "connectionCount"
      FROM "network_metrics"
      WHERE "device_id" = '${deviceId}' 
        AND time >= now() - ${timeRange}
      GROUP BY time(5m), "interface"
      ORDER BY time DESC
    `);
    
    return result;
  } catch (error) {
    console.error('Error querying InfluxDB:', error);
    throw error;
  }
}

export async function queryDeviceMetrics(deviceId: string, timeRange: string = '1h'): Promise<any[]> {
  const db = getInfluxDB();
  
  try {
    const result = await db.query(`
      SELECT 
        mean("cpu_usage") as "cpuUsage",
        mean("memory_usage") as "memoryUsage",
        mean("temperature") as "temperature",
        last("uptime") as "uptime"
      FROM "device_metrics"
      WHERE "device_id" = '${deviceId}' 
        AND time >= now() - ${timeRange}
      GROUP BY time(5m)
      ORDER BY time DESC
    `);
    
    return result;
  } catch (error) {
    console.error('Error querying InfluxDB:', error);
    throw error;
  }
}
