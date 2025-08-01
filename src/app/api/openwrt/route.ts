import { NextRequest, NextResponse } from 'next/server';
import SSH from '@/lib/ssh';

// Default router configuration (should be moved to environment variables)
const DEFAULT_ROUTER_CONFIG = {
  host: process.env.OPENWRT_HOST || '192.168.1.1',
  username: process.env.OPENWRT_USERNAME || 'root',
  password: process.env.OPENWRT_PASSWORD || 'password',
  port: parseInt(process.env.OPENWRT_PORT || '22')
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    const ssh = new SSH(DEFAULT_ROUTER_CONFIG);

    switch (action) {
      case 'system':
        const systemInfo = await ssh.getSystemInfo();
        return NextResponse.json(systemInfo);

      case 'network':
        const networkInterfaces = await ssh.getNetworkInterfaces();
        return NextResponse.json(networkInterfaces);

      case 'wifi':
        const wifiStatus = await ssh.getWifiStatus();
        return NextResponse.json(wifiStatus);

      case 'devices':
        const connectedDevices = await ssh.getConnectedDevices();
        return NextResponse.json({ devices: connectedDevices });

      case 'dhcp':
        const dhcpLeases = await ssh.getDHCPLeases();
        return NextResponse.json(dhcpLeases);

      case 'status':
      default:
        // Get comprehensive status
        const [system, network, wifi, devices] = await Promise.all([
          ssh.getSystemInfo(),
          ssh.getNetworkInterfaces(),
          ssh.getWifiStatus(),
          ssh.getConnectedDevices()
        ]);

        const status = {
          system: {
            uptime: system.uptime,
            load: system.load,
            memory: system.memory
          },
          network: {
            interfaces: network.interface?.length || 0,
            connectedDevices: devices.length
          },
          wifi: {
            radios: Object.keys(wifi).length,
            clients: Object.values(wifi).reduce((total: number, radio: any) => {
              if (radio.interfaces) {
                return total + radio.interfaces.reduce((ifaceTotal: number, iface: any) => {
                  return ifaceTotal + (iface.clients ? Object.keys(iface.clients).length : 0);
                }, 0);
              }
              return total;
            }, 0)
          }
        };

        return NextResponse.json(status);
    }
  } catch (error) {
    console.error('Error fetching OpenWrt data:', error);
    return NextResponse.json(
      { error: `Failed to fetch router data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { command, host, username, password, port } = await request.json();
    
    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Use provided credentials or fall back to defaults
    const sshConfig = {
      host: host || DEFAULT_ROUTER_CONFIG.host,
      username: username || DEFAULT_ROUTER_CONFIG.username,
      password: password || DEFAULT_ROUTER_CONFIG.password,
      port: port || DEFAULT_ROUTER_CONFIG.port
    };

    const ssh = new SSH(sshConfig);
    const output = await ssh.execute(command);
    
    const result = {
      command,
      output,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing command:', error);
    return NextResponse.json(
      { error: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
