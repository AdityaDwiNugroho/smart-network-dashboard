import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { NetworkMetrics } from '@/types';

export function useNetworkMonitoring() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketIo = io({
      path: '/api/socket',
    });

    socketIo.on('connect', () => {
      setIsConnected(true);
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
    });

    socketIo.on('metrics_update', (data: NetworkMetrics) => {
      setMetrics(data);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return {
    isConnected,
    metrics,
    socket,
  };
}
