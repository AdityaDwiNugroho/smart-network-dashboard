'use client';

import { useState, useEffect, useRef } from 'react';

export interface RealTimeMetrics {
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
  devices: Array<{
    hostname: string;
    ipv4: string;
    macaddr: string;
    interface: string;
    leasetime: number;
    lastSeen: Date;
    signalStrength?: number | null;
  }>;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

export function useRealTimeMetrics(wsUrl?: string) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    error: null,
    lastConnected: null
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // Start with 1 second

  const url = wsUrl || `ws://localhost:3003`;

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log('Connecting to real-time metrics WebSocket:', url);
      setConnectionStatus(prev => ({ ...prev, reconnecting: true, error: null }));
      
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to real-time metrics WebSocket');
        setConnectionStatus({
          connected: true,
          reconnecting: false,
          error: null,
          lastConnected: new Date()
        });
        reconnectAttemptsRef.current = 0;

        // Subscribe to real-time updates
        ws.send(JSON.stringify({ type: 'subscribe' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'metrics' && message.data) {
            // Convert timestamp strings to Date objects
            const data = {
              ...message.data,
              timestamp: new Date(message.data.timestamp),
              devices: message.data.devices?.map((device: any) => ({
                ...device,
                lastSeen: new Date(device.lastSeen)
              })) || []
            };
            
            setMetrics(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnectionStatus(prev => ({ 
          ...prev, 
          connected: false,
          reconnecting: false 
        }));

        // Auto-reconnect logic
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            30000 // Max 30 seconds
          );
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setConnectionStatus(prev => ({
            ...prev,
            error: 'Maximum reconnection attempts reached',
            reconnecting: false
          }));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          error: 'Connection error',
          reconnecting: false
        }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: 'Failed to create connection',
        reconnecting: false
      }));
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus({
      connected: false,
      reconnecting: false,
      error: null,
      lastConnected: null
    });
  };

  const reconnect = () => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 100);
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [url]);

  // Ping/keepalive mechanism
  useEffect(() => {
    if (!connectionStatus.connected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [connectionStatus.connected]);

  return {
    metrics,
    connectionStatus,
    reconnect,
    disconnect,
    isConnected: connectionStatus.connected,
    isReconnecting: connectionStatus.reconnecting,
    error: connectionStatus.error
  };
}
