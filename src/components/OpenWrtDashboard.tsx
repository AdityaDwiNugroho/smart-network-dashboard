'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  WifiIcon, 
  ComputerIcon, 
  ActivityIcon, 
  NetworkIcon,
  RefreshCwIcon,
  TerminalIcon,
  RouterIcon,
  ServerIcon
} from 'lucide-react';

interface RouterStatus {
  system: {
    uptime: number;
    load: number[];
    memory: {
      total: number;
      free: number;
      available: number;
    };
  };
  network: {
    interfaces: number;
    connectedDevices: number;
  };
  wifi: {
    radios: number;
    clients: number;
  };
}

interface ConnectedDevice {
  mac: string;
  hostname: string;
  ip?: string;
  wifi?: {
    signal: number;
    noise: number;
    rx_rate: number;
    tx_rate: number;
  };
}

export default function OpenWrtDashboard() {
  const [routerStatus, setRouterStatus] = useState<RouterStatus | null>(null);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [commandOutput, setCommandOutput] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);

  const fetchRouterStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/openwrt?action=status');
      if (response.ok) {
        const data = await response.json();
        setRouterStatus(data);
      } else {
        console.error('Failed to fetch router status');
      }
    } catch (error) {
      console.error('Error fetching router status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedDevices = async () => {
    try {
      const response = await fetch('/api/openwrt?action=devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      } else {
        console.error('Failed to fetch connected devices');
      }
    } catch (error) {
      console.error('Error fetching connected devices:', error);
    }
  };

  const executeCommand = async () => {
    if (!customCommand.trim()) return;
    
    try {
      setCommandLoading(true);
      const response = await fetch('/api/openwrt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: customCommand })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommandOutput(data.output || 'Command executed successfully');
      } else {
        const error = await response.json();
        setCommandOutput(`Error: ${error.error}`);
      }
    } catch (error) {
      setCommandOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCommandLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let value = bytes;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  useEffect(() => {
    fetchRouterStatus();
    fetchConnectedDevices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRouterStatus();
      fetchConnectedDevices();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !routerStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCwIcon className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Connecting to OpenWrt router...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">OpenWrt Router Management</h1>
        <Button 
          onClick={() => {
            fetchRouterStatus();
            fetchConnectedDevices();
          }} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routerStatus ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {routerStatus ? `Uptime: ${formatUptime(routerStatus.system.uptime)}` : 'No connection'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routerStatus 
                ? `${Math.round(((routerStatus.system.memory.total - routerStatus.system.memory.available) / routerStatus.system.memory.total) * 100)}%`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {routerStatus 
                ? `${formatBytes(routerStatus.system.memory.available)} available`
                : 'No data'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WiFi Clients</CardTitle>
            <WifiIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routerStatus?.wifi.clients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {routerStatus?.wifi.radios || 0} radios active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
            <ComputerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total network devices
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="network">Network Info</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Devices currently connected to your OpenWrt router
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No devices found or unable to connect to router
                  </p>
                ) : (
                  devices.map((device) => (
                    <div key={device.mac} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {device.wifi ? (
                            <WifiIcon className="h-6 w-6 text-blue-500" />
                          ) : (
                            <NetworkIcon className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{device.hostname}</p>
                          <p className="text-sm text-muted-foreground">{device.mac}</p>
                          {device.ip && (
                            <p className="text-sm text-muted-foreground">{device.ip}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={device.wifi ? "default" : "secondary"}>
                          {device.wifi ? "WiFi" : "Ethernet"}
                        </Badge>
                        {device.wifi && (
                          <div className="text-xs text-muted-foreground">
                            Signal: {device.wifi.signal}dBm
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Interfaces</CardTitle>
              <CardDescription>
                Router network interface status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">System Load</h3>
                    <p className="text-sm text-muted-foreground">
                      {routerStatus?.system.load.map((load, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {load.toFixed(2)}
                        </span>
                      )) || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Network Interfaces</h3>
                    <p className="text-sm text-muted-foreground">
                      {routerStatus?.network.interfaces || 0} interfaces configured
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TerminalIcon className="h-5 w-5 mr-2" />
                Router Terminal
              </CardTitle>
              <CardDescription>
                Execute commands directly on your OpenWrt router
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter ubus command (e.g., ubus call system board)"
                  value={customCommand}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomCommand(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && executeCommand()}
                />
                <Button 
                  onClick={executeCommand} 
                  disabled={commandLoading || !customCommand.trim()}
                >
                  {commandLoading ? 'Executing...' : 'Execute'}
                </Button>
              </div>
              <Textarea
                value={commandOutput}
                placeholder="Command output will appear here..."
                readOnly
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
