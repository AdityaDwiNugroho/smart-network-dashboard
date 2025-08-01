// Temporary stub for InfluxDB functionality
// TODO: Re-implement with proper InfluxDB integration

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

export function getInfluxDB() {
  if (typeof window !== 'undefined') {
    throw new Error('InfluxDB should only be used on the server side');
  }
  
  // Stub implementation
  return {
    writePoints: async (points: any[]) => {
      console.log('Stub: Would write points to InfluxDB:', points);
    },
    query: async (query: string) => {
      console.log('Stub: Would query InfluxDB with:', query);
      return [];
    }
  };
}

export async function writeNetworkMetrics(metrics: NetworkMetrics): Promise<void> {
  console.log('Stub: Would write network metrics:', metrics);
  // TODO: Implement actual InfluxDB writing
}

export async function queryNetworkMetrics(deviceId: string, timeRange: string = '1h'): Promise<any[]> {
  console.log('Stub: Would query network metrics for device:', deviceId, 'timeRange:', timeRange);
  // TODO: Implement actual InfluxDB querying
  return [];
}

export async function queryDeviceMetrics(deviceId: string, timeRange: string = '1h'): Promise<any[]> {
  console.log('Stub: Would query device metrics for device:', deviceId, 'timeRange:', timeRange);
  // TODO: Implement actual InfluxDB querying
  return [];
}
