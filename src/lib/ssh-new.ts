// Temporary stub for SSH functionality
// TODO: Re-implement with proper SSH2 integration

export interface SSHConfig {
  host: string;
  username: string;
  password: string;
  port?: number;
}

export default class SSH {
  private config: SSHConfig;

  constructor(config: SSHConfig) {
    this.config = {
      ...config,
      port: config.port || 22
    };
  }

  async execute(command: string): Promise<string> {
    console.log(`Stub: Would execute SSH command "${command}" on ${this.config.host}`);
    // TODO: Implement actual SSH execution
    return `Stub result for: ${command}`;
  }

  async getSystemInfo(): Promise<any> {
    console.log('Stub: Would get system info via SSH');
    // TODO: Implement actual SSH system info retrieval
    return {
      hostname: 'stub-hostname',
      uptime: '1 day',
      memory: 'stub memory info',
      load: 'stub load info'
    };
  }

  async getNetworkInterfaces(): Promise<any> {
    console.log('Stub: Would get network interfaces via SSH');
    return [];
  }

  async getWifiStatus(): Promise<any> {
    console.log('Stub: Would get WiFi status via SSH');
    return {};
  }

  async getDHCPLeases(): Promise<any> {
    console.log('Stub: Would get DHCP leases via SSH');
    return [];
  }

  async getConnectedDevices(): Promise<any[]> {
    console.log('Stub: Would get connected devices via SSH');
    // TODO: Implement actual SSH device discovery
    return [];
  }
}
