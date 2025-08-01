import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { NetworkMetrics, Device } from '@/types';

interface UseRealtimeMetricsOptions {
  deviceId: string;
  onError?: (error: Error) => void;
}

export function useRealtimeMetrics({ deviceId, onError }: UseRealtimeMetricsOptions) {
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('subscribe', { deviceId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('metrics', (data: NetworkMetrics) => {
      setMetrics(data);
    });

    socket.on('connect_error', (err: Error) => {
      setError(err);
      onError?.(err);
    });

    return () => {
      socket.off('metrics');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.close();
    };
  }, [deviceId, onError]);

  return { metrics, isConnected, error };
}

interface UseDeviceStatusOptions {
  refreshInterval?: number;
}

export function useDeviceStatus({ refreshInterval = 30000 }: UseDeviceStatusOptions = {}) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    async function fetchDevices() {
      try {
        const response = await fetch('/api/devices');
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        const data = await response.json();
        setDevices(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    function pollDevices() {
      fetchDevices();
      timeoutId = setTimeout(pollDevices, refreshInterval);
    }

    pollDevices();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [refreshInterval]);

  return { devices, isLoading, error };
}
