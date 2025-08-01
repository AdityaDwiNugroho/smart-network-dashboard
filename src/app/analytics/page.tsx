'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { ClientTime } from '@/components/ClientTime';
import { DeviceTimestamp } from '@/components/DeviceTimestamp';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wifi, 
  Activity, 
  Users, 
  Zap,
  Download,
  Upload,
  Signal,
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react';

interface HistoricalData {
  timestamp: string;
  memoryUsage: number;
  connectedDevices: number;
  wifiClients: number;
  totalRx: number;
  totalTx: number;
  systemLoad: number;
}

export default function AnalyticsPage() {
  const { metrics, isConnected, isReconnecting, connectionStatus, error, reconnect } = useRealTimeMetrics();
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Store historical data as metrics come in
  useEffect(() => {
    if (metrics) {
      const newDataPoint: HistoricalData = {
        timestamp: new Date().toLocaleTimeString(),
        memoryUsage: metrics.system.memory.percentage,
        connectedDevices: metrics.network.connectedDevices,
        wifiClients: metrics.wifi.clients,
        totalRx: metrics.network.totalRx / (1024 * 1024), // Convert to MB
        totalTx: metrics.network.totalTx / (1024 * 1024), // Convert to MB
        systemLoad: parseFloat(metrics.system.load.split(' ')[0]) || 0
      };

      setHistoricalData(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only last 100 data points for performance
        return updated.slice(-100);
      });
    }
  }, [metrics]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!metrics || historicalData.length < 2) {
      return {
        memoryTrend: 0,
        devicesTrend: 0,
        wifiTrend: 0,
        peakMemory: 0,
        avgDevices: 0,
        totalTraffic: 0,
        uptime: '0h',
        efficiency: 0
      };
    }

    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    const memoryTrend = latest.memoryUsage - previous.memoryUsage;
    const devicesTrend = latest.connectedDevices - previous.connectedDevices;
    const wifiTrend = latest.wifiClients - previous.wifiClients;
    
    const peakMemory = Math.max(...historicalData.map(d => d.memoryUsage));
    const avgDevices = Math.round(historicalData.reduce((sum, d) => sum + d.connectedDevices, 0) / historicalData.length);
    const totalTraffic = latest.totalRx + latest.totalTx;
    
    // Calculate system efficiency (inverse of load vs devices)
    const efficiency = latest.connectedDevices > 0 
      ? Math.max(0, 100 - (latest.systemLoad * 10) - (latest.memoryUsage * 0.5))
      : 85;

    return {
      memoryTrend,
      devicesTrend,
      wifiTrend,
      peakMemory,
      avgDevices,
      totalTraffic,
      uptime: metrics.system.uptime,
      efficiency: Math.round(efficiency)
    };
  }, [metrics, historicalData]);

  // Device type distribution (simulated)
  const deviceTypeData = useMemo(() => {
    if (!metrics?.devices) return [];
    
    const types = metrics.devices.reduce((acc: any, device) => {
      // Simple device type detection based on hostname patterns
      let type = 'Unknown';
      const hostname = device.hostname?.toLowerCase() || '';
      
      if (hostname.includes('iphone') || hostname.includes('android') || hostname.includes('phone')) {
        type = 'Mobile';
      } else if (hostname.includes('laptop') || hostname.includes('pc') || hostname.includes('mac')) {
        type = 'Computer';
      } else if (hostname.includes('tv') || hostname.includes('roku') || hostname.includes('chrome')) {
        type = 'Media';
      } else if (hostname.includes('esp') || hostname.includes('arduino') || hostname.includes('sensor')) {
        type = 'IoT';
      } else if (device.interface?.includes('eth')) {
        type = 'Ethernet';
      } else {
        type = 'WiFi Device';
      }
      
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [metrics?.devices]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Real-Time Analytics</h1>
            <p className="text-gray-400 mt-1">Live network insights and performance metrics</p>
          </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 
                    isReconnecting ? 'bg-yellow-500 animate-pulse' : 
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-400">
                    {isConnected ? 'Connected' : 
                     isReconnecting ? 'Reconnecting...' : 
                     'Disconnected'}
                  </span>
                  {error && (
                    <span className="text-xs text-red-400 ml-2">
                      ({error})
                    </span>
                  )}
                  {!isConnected && (
                    <button 
                      onClick={reconnect}
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Reconnect
                    </button>
                  )}
                </div>
                {metrics && (
                  <div className="text-xs text-gray-500">
                    Last update: {new Date(metrics.timestamp).toLocaleTimeString()}
                  </div>
                )}
                <ClientTime />
              </div>
            </div>
          </div>

          {/* No Data State */}
          {!isConnected && !metrics && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-yellow-500" />
                <h3 className="text-yellow-200 font-medium">Waiting for Real-Time Data</h3>
              </div>
              <p className="text-yellow-100/80 text-sm mt-2">
                WebSocket server on port 3003 is {' '}
                <span className="font-mono bg-slate-800 px-1 rounded">ws://localhost:3003</span>
                {error ? ` - Error: ${error}` : ''}
              </p>
              <p className="text-yellow-100/60 text-xs mt-1">
                Displaying mock data until connection is established.
              </p>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* System Efficiency */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">System Efficiency</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.efficiency}%</div>
                <p className="text-xs text-gray-400">Performance score</p>
              </CardContent>
            </Card>

            {/* Memory Trend */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Memory Trend</CardTitle>
                <HardDrive className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-white">
                    {metrics?.system.memory.percentage.toFixed(1) || 0}%
                  </div>
                  <div className="flex items-center">
                    {analytics.memoryTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : analytics.memoryTrend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`text-xs ml-1 ${
                      analytics.memoryTrend > 0 ? 'text-red-400' : 
                      analytics.memoryTrend < 0 ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {analytics.memoryTrend > 0 ? '+' : ''}{analytics.memoryTrend.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Peak: {analytics.peakMemory.toFixed(1)}%</p>
              </CardContent>
            </Card>

            {/* Network Activity */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Network Traffic</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatBytes(analytics.totalTraffic * 1024 * 1024)}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3 text-green-400" />
                    <span>{formatBytes((metrics?.network.totalRx || 0))}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Upload className="h-3 w-3 text-blue-400" />
                    <span>{formatBytes((metrics?.network.totalTx || 0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Activity */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Connected Devices</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-white">
                    {metrics?.network.connectedDevices || 0}
                  </div>
                  <div className="flex items-center">
                    {analytics.devicesTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : analytics.devicesTrend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`text-xs ml-1 ${
                      analytics.devicesTrend > 0 ? 'text-green-400' : 
                      analytics.devicesTrend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {analytics.devicesTrend > 0 ? '+' : ''}{analytics.devicesTrend}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">WiFi: {metrics?.wifi.clients || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Memory Usage Trend */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Memory Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="memoryUsage" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Connections */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Connected Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="connectedDevices" stroke="#10B981" strokeWidth={3} />
                      <Line type="monotone" dataKey="wifiClients" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Traffic and Device Types */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Network Traffic */}
            <Card className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Network Traffic (MB)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="totalRx" fill="#10B981" name="Download" />
                      <Bar dataKey="totalTx" fill="#3B82F6" name="Upload" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Types Distribution */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {deviceTypeData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-300">{entry.name}</span>
                      </div>
                      <span className="text-white font-medium">{String(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          {metrics && (
            <div className="mt-8 text-center text-xs text-gray-500">
              Real-time data • Last updated: <DeviceTimestamp timestamp={metrics.timestamp} format="datetime" />
            </div>
          )}
        </div>
  );
}
