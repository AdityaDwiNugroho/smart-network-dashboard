'use client';

import React, { useEffect, useState } from 'react';
import { useNetworkMetrics } from '@/hooks/useNetworkMetrics';
import { queryNetworkMetrics } from '@/lib/influxdb';

interface NetworkStatsProps {
  deviceId: string;
  host: string;
  interfaces: number[];
}

export function NetworkStats({
  deviceId,
  host,
  interfaces,
}: NetworkStatsProps) {
  const { metrics, error } = useNetworkMetrics(deviceId, host, interfaces);
  const [historicalData, setHistoricalData] = useState<any>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const data = await queryNetworkMetrics(deviceId, '1h');
        setHistoricalData(data);
      } catch (err) {
        console.error('Error fetching historical data:', err);
      }
    };

    fetchHistoricalData();
    const intervalId = setInterval(fetchHistoricalData, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [deviceId]);

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Gbps`;
    }
    return `${speed.toFixed(1)} Mbps`;
  };

  // Get the first interface's metrics as an example
  const primaryInterface = Object.values(metrics)[0];
  const latestHistorical = historicalData?.[0];

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Error</h3>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Upload Speed</p>
          <p className="text-xl font-bold text-gray-900">
            {primaryInterface ? formatSpeed(primaryInterface.bandwidth_out) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Download Speed</p>
          <p className="text-xl font-bold text-gray-900">
            {primaryInterface ? formatSpeed(primaryInterface.bandwidth_in) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Latency</p>
          <p className="text-xl font-bold text-gray-900">
            {latestHistorical?.latency?.toFixed(1) || 'N/A'} ms
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Packet Loss</p>
          <p className="text-xl font-bold text-gray-900">
            {latestHistorical?.packet_loss?.toFixed(2) || 'N/A'}%
          </p>
        </div>
      </div>
    </div>
  );
}
