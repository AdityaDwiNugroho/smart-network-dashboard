'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Lightbulb, 
  Shield, 
  Thermometer,
  Camera,
  Wifi,
  Battery,
  Zap,
  Users,
  Clock,
  TrendingUp,
  Settings,
  Power,
  Sun,
  Moon,
  Eye,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { ClientTime } from './ClientTime';
import { DeviceTimestamp } from './DeviceTimestamp';

interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'camera' | 'sensor' | 'lock' | 'outlet' | 'speaker';
  room: string;
  status: 'online' | 'offline' | 'warning';
  battery?: number;
  value?: string | number;
  lastUpdate: Date;
  controls?: any;
}

export default function SmartHomeDashboard() {
  const [devices, setDevices] = useState<SmartDevice[]>([
    {
      id: '1',
      name: 'Living Room Lights',
      type: 'light',
      room: 'Living Room',
      status: 'online',
      value: '75%',
      lastUpdate: new Date(),
      controls: { brightness: 75, color: 'warm' }
    },
    {
      id: '2',
      name: 'Main Thermostat',
      type: 'thermostat',
      room: 'Living Room',
      status: 'online',
      value: '72°F',
      lastUpdate: new Date(),
      controls: { temperature: 72, mode: 'cool' }
    },
    {
      id: '3',
      name: 'Front Door Camera',
      type: 'camera',
      room: 'Entrance',
      status: 'online',
      value: 'Recording',
      lastUpdate: new Date()
    },
    {
      id: '4',
      name: 'Motion Sensor',
      type: 'sensor',
      room: 'Hallway',
      status: 'online',
      battery: 85,
      value: 'No Motion',
      lastUpdate: new Date()
    },
    {
      id: '5',
      name: 'Smart Lock',
      type: 'lock',
      room: 'Front Door',
      status: 'online',
      battery: 92,
      value: 'Locked',
      lastUpdate: new Date()
    },
    {
      id: '6',
      name: 'Kitchen Outlet',
      type: 'outlet',
      room: 'Kitchen',
      status: 'offline',
      value: 'Off',
      lastUpdate: new Date(Date.now() - 300000)
    }
  ]);

  const [homeStats, setHomeStats] = useState({
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status === 'online').length,
    energyUsage: '2.4 kWh',
    securityStatus: 'Armed',
    temperature: '72°F',
    humidity: '45%'
  });

  const toggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            status: device.status === 'online' ? 'offline' : 'online',
            lastUpdate: new Date()
          }
        : device
    ));
  };

  const getDeviceIcon = (type: SmartDevice['type'], status: string) => {
    const iconClass = `h-6 w-6 ${status === 'online' ? 'text-green-400' : status === 'offline' ? 'text-red-400' : 'text-yellow-400'}`;
    
    switch (type) {
      case 'light':
        return <Lightbulb className={iconClass} />;
      case 'thermostat':
        return <Thermometer className={iconClass} />;
      case 'camera':
        return <Camera className={iconClass} />;
      case 'sensor':
        return <Eye className={iconClass} />;
      case 'lock':
        return status === 'online' ? <Lock className={iconClass} /> : <Unlock className="h-6 w-6 text-red-400" />;
      case 'outlet':
        return <Zap className={iconClass} />;
      default:
        return <Settings className={iconClass} />;
    }
  };

  const getStatusBadge = (status: SmartDevice['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="status-online">Online</Badge>;
      case 'offline':
        return <Badge className="status-offline">Offline</Badge>;
      case 'warning':
        return <Badge className="status-warning">Warning</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  useEffect(() => {
    // Update stats when devices change
    setHomeStats(prev => ({
      ...prev,
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length
    }));
  }, [devices]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/30">
            <Home className="h-8 w-8 text-blue-400" />
          </div>
          <div>
              <h1 className="text-4xl font-bold text-white">Smart Home</h1>
              <p className="text-slate-400 text-lg">Dashboard & Control Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <ClientTime />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="smart-card gradient-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Devices</CardTitle>
              <Settings className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{homeStats.totalDevices}</div>
              <p className="text-xs text-blue-200">
                {homeStats.onlineDevices} online
              </p>
            </CardContent>
          </Card>

          <Card className="smart-card gradient-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Energy Usage</CardTitle>
              <Zap className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{homeStats.energyUsage}</div>
              <p className="text-xs text-green-200">
                -12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="smart-card gradient-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Climate</CardTitle>
              <Thermometer className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{homeStats.temperature}</div>
              <p className="text-xs text-orange-200">
                Humidity: {homeStats.humidity}
              </p>
            </CardContent>
          </Card>

          <Card className="smart-card gradient-purple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Security</CardTitle>
              <Shield className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{homeStats.securityStatus}</div>
              <p className="text-xs text-purple-200">
                All systems secure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Device Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Device Control</h2>
            <Button className="smart-button">
              <Settings className="h-4 w-4 mr-2" />
              Manage Devices
            </Button>
          </div>

          <div className="dashboard-grid">
            {devices.map((device) => (
              <Card key={device.id} className={`smart-card device-${device.type} hover:scale-105 transition-transform duration-200`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type, device.status)}
                    <div>
                      <CardTitle className="text-lg text-white">{device.name}</CardTitle>
                      <CardDescription className="text-slate-400">{device.room}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(device.status)}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Status:</span>
                    <span className="text-lg font-semibold text-white">{device.value}</span>
                  </div>
                  
                  {device.battery && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Battery:</span>
                      <div className="flex items-center space-x-2">
                        <Battery className={`h-4 w-4 ${device.battery > 20 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className="text-sm text-white">{device.battery}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Last updated:</span>
                    <DeviceTimestamp timestamp={device.lastUpdate} />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => toggleDevice(device.id)}
                      className={`flex-1 ${device.status === 'online' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {device.status === 'online' ? 'Turn Off' : 'Turn On'}
                    </Button>
                    {device.type === 'light' && (
                      <Button size="sm" variant="outline">
                        <Sun className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="smart-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Moon className="h-5 w-5 mr-2 text-blue-400" />
                  Good Night Mode
                </CardTitle>
                <CardDescription>Turn off all lights and arm security</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="smart-button w-full">Activate</Button>
              </CardContent>
            </Card>

            <Card className="smart-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-yellow-400" />
                  Morning Mode
                </CardTitle>
                <CardDescription>Turn on lights and adjust thermostat</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="smart-button w-full">Activate</Button>
              </CardContent>
            </Card>

            <Card className="smart-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-400" />
                  Away Mode
                </CardTitle>
                <CardDescription>Energy saving and security mode</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="smart-button w-full">Activate</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
