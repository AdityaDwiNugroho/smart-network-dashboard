
import { useEffect, useState } from 'react';
import { SNMPService, SNMPMetrics } from '@/services/snmp';
import { writeNetworkMetrics } from '@/lib/influxdb';
import { pingHost } from '@/lib/ping';

export function useNetworkMetrics(deviceId: string, host: string, interfaces: number[]) {
  const [metrics, setMetrics] = useState<{ [key: string]: SNMPMetrics }>({});
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const snmpService = new SNMPService(host);
    let previousMetrics: { [key: string]: SNMPMetrics } = {};
    let intervalId: NodeJS.Timeout;

    const collectMetrics = async () => {
      try {
        const newMetrics: { [key: string]: SNMPMetrics } = {};

        // Collect metrics for each interface

        for (const interfaceIndex of interfaces) {
          const interfaceMetrics = await snmpService.getInterfaceMetrics(interfaceIndex);
          // Attempt to ping the host for latency measurement
          let latency = 0;
          try {
            latency = await pingHost(host);
          } catch (e) {
            latency = -1; // Indicate ping failure
          }
          newMetrics[interfaceMetrics.interface] = {
            ...interfaceMetrics,
            latency,
            // connection_count: 0 // Placeholder, not yet implemented
          } as SNMPMetrics & { latency: number };

          // Calculate rates if we have previous metrics
          if (previousMetrics[interfaceMetrics.interface]) {
            const prev = previousMetrics[interfaceMetrics.interface];
            const timeDiff = 30; // 30 seconds between measurements

            // Calculate bandwidth in Mbps
            const bandwidthIn = (interfaceMetrics.bandwidth_in - prev.bandwidth_in) * 8 / (timeDiff * 1000000);
            const bandwidthOut = (interfaceMetrics.bandwidth_out - prev.bandwidth_out) * 8 / (timeDiff * 1000000);

            // Write to InfluxDB
            await writeNetworkMetrics({
              deviceId: deviceId,
              interface: interfaceMetrics.interface,
              timestamp: new Date(),
              bandwidthIn: bandwidthIn,
              bandwidthOut: bandwidthOut,
              latency: latency,
              packetLoss: 0, // Not yet implemented
              connectionCount: 0 // Placeholder for future implementation
            });
          }
        }

        previousMetrics = newMetrics;
        setMetrics(newMetrics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };

    // Collect metrics immediately and then every 30 seconds
    collectMetrics();
    intervalId = setInterval(collectMetrics, 30000);

    return () => {
      clearInterval(intervalId);
      snmpService.close();
    };
  }, [deviceId, host, interfaces]);

  return { metrics, error };
}
