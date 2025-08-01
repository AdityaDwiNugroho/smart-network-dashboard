'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientTime } from '@/components/ClientTime';
import { DeviceTimestamp } from '@/components/DeviceTimestamp';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';

export default function RealTimeSmartHomeDashboard() {
  const { 
    metrics, 
    connectionStatus, 
    isConnected, 
    isReconnecting, 
    error, 
    reconnect 
  } = useRealTimeMetrics();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Stop loading once we get first metrics or after 10 seconds
    if (metrics || error) {
      setIsLoading(false);
    } else {
      const timeout = setTimeout(() => setIsLoading(false), 10000);
      return () => clearTimeout(timeout);
    }
  }, [metrics, error]);

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (uptime: string): string => {
    // If already formatted by SSH, return as is
    if (uptime.includes('d') || uptime.includes('h')) {
      return uptime;
    }
    // Otherwise try to parse seconds
    const seconds = parseInt(uptime);
    if (isNaN(seconds)) return uptime;
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Smart Home Dashboard</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Connecting...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-slate-700 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Smart Home Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 
              isReconnecting ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Live' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
          </div>
          <ClientTime />
        </div>
      </div>

      {/* Connection Error Alert */}
      {error && (
        <Alert className="bg-red-900/50 border-red-700">
          <AlertDescription className="text-red-200">
            Connection Error: {error}
            <Button 
              onClick={reconnect} 
              variant="outline" 
              size="sm" 
              className="ml-2 text-red-200 border-red-600 hover:bg-red-800"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* System Status */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">System Status</CardTitle>
            <Badge variant={isConnected ? "default" : "secondary"} className="bg-green-900 text-green-100">
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics ? formatUptime(metrics.system.uptime) : 'Unknown'}
            </div>
            <p className="text-xs text-gray-400">
              Load: {metrics?.system.load || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Memory Usage</CardTitle>
            <Badge variant="outline" className="border-blue-600 text-blue-400">
              {metrics ? `${metrics.system.memory.percentage.toFixed(1)}%` : '0%'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics ? formatBytes(metrics.system.memory.used) : '0 MB'}
            </div>
            <p className="text-xs text-gray-400">
              of {metrics ? formatBytes(metrics.system.memory.total) : '0 MB'} total
            </p>
            {metrics && (
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${metrics.system.memory.percentage}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WiFi Clients */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">WiFi Clients</CardTitle>
            <Badge variant="outline" className="border-purple-600 text-purple-400">
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics?.wifi.clients || 0}
            </div>
            <p className="text-xs text-gray-400">
              {metrics?.wifi.radios || 0} radio{(metrics?.wifi.radios || 0) !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Connected Devices</CardTitle>
            <Badge variant="outline" className="border-green-600 text-green-400">
              {metrics?.network.connectedDevices || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics?.network.connectedDevices || 0}
            </div>
            <p className="text-xs text-gray-400">
              {metrics?.network.interfaces || 0} interface{(metrics?.network.interfaces || 0) !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Network Traffic */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Network Traffic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Download (RX)</span>
              <span className="text-green-400 font-mono">
                {metrics ? formatBytes(metrics.network.totalRx) : '0 B'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Upload (TX)</span>
              <span className="text-blue-400 font-mono">
                {metrics ? formatBytes(metrics.network.totalTx) : '0 B'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices List */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {metrics?.devices?.slice(0, 6).map((device, index) => (
                <div key={device.macaddr} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {device.hostname || 'Unknown Device'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {device.ipv4} • {device.interface}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {device.signalStrength && (
                      <div className="text-xs text-gray-400">
                        {device.signalStrength}dBm
                      </div>
                    )}
                    <DeviceTimestamp timestamp={device.lastSeen} format="time" />
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-400 py-4">
                  No devices detected
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {metrics && (
        <div className="text-center text-xs text-gray-500">
          Last updated: <DeviceTimestamp timestamp={metrics.timestamp} format="datetime" />
        </div>
      )}
    </div>
  );
}
