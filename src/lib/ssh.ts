import { Client } from 'ssh2';

export interface SSHConfig {
  host: string;
  username: string;
  password: string;
  port?: number;
}

export interface SystemInfo {
  hostname: string;
  uptime: string;
  load: string;
  memory: {
    total: number;
    free: number;
    available: number;
    used: number;
  };
  board: any;
  kernel: string;
}

export interface NetworkInterface {
  interface: string;
  proto: string;
  up: boolean;
  pending: boolean;
  available: boolean;
  autostart: boolean;
  dynamic: boolean;
  uptime: number;
  l3_device: string;
  device: string;
  metric: number;
  dns_metric: number;
  delegation: boolean;
  ipv4_address?: Array<{
    address: string;
    mask: number;
  }>;
  ipv6_address?: Array<{
    address: string;
    mask: number;
  }>;
  route?: any[];
  dns_server?: string[];
  dns_search?: string[];
  neighbors?: any[];
  inactive?: any;
  data?: any;
}

export interface WiFiStatus {
  [radioName: string]: {
    up: boolean;
    pending: boolean;
    autostart: boolean;
    disabled: boolean;
    retry_setup_failed: boolean;
    config: {
      phy: string;
      path: string;
      legacy_rates: boolean;
      beacon_int: number;
      basic_rate: any[];
      supported_rates: any[];
      require_mode: string;
      modes: string[];
      htmode: string;
      hwmode: string;
      channels: any[];
      channel: number;
      chanbw: number;
      frequency: number;
      txpower_offset: number;
      txpower: number;
      country: string;
      dfs: boolean;
      channels_2g: any[];
      channels_5g: any[];
      channels_5g_dfs: any[];
      channels_6g: any[];
    };
    interfaces: Array<{
      section: string;
      ifname: string;
      config: {
        mode: string;
        ssid: string;
        encryption: string;
        key: string;
        wps_pushbutton: boolean;
        wps_label: boolean;
        wps_device_name: string;
        wps_device_type: string;
        wps_manufacturer: string;
        wps_pin: string;
        wps_ap_setup_locked: string;
        wps_independent: boolean;
        wps_not_configured: boolean;
        wps_config_methods: string;
        wps_rf_bands: string;
        wmm: boolean;
        wmm_noack: boolean;
        wmm_apsd: boolean;
        tx_burst: boolean;
        probe_response_timeout: number;
        fils_discovery_interval: number;
        unsolicited_probe_response_interval: number;
        wds: boolean;
        wds_sta: boolean;
        wds_bridge: string;
        isolate: boolean;
        doth: boolean;
        wmm_uapsd: boolean;
        tdls_prohibit: boolean;
        multicast_to_unicast: boolean;
        proxy_arp: boolean;
        per_sta_vif: boolean;
      };
      clients?: {
        [macAddress: string]: {
          auth: boolean;
          assoc: boolean;
          authorized: boolean;
          preauth: boolean;
          wds: boolean;
          wmm: boolean;
          ht: boolean;
          vht: boolean;
          he: boolean;
          wps: boolean;
          mfp: boolean;
          rrm: any[];
          extended_capabilities: any[];
          aid: number;
          signature: string;
          rx: {
            drop_misc: number;
            packets: number;
            bytes: number;
            rate: number;
            mcs: number;
            '40mhz': number;
            short_gi: number;
            vht_mcs: number;
            vht_nss: number;
            he_mcs: number;
            he_nss: number;
            he_gi: number;
            he_dcm: number;
          };
          tx: {
            drop_misc: number;
            packets: number;
            bytes: number;
            rate: number;
            mcs: number;
            '40mhz': number;
            short_gi: number;
            vht_mcs: number;
            vht_nss: number;
            he_mcs: number;
            he_nss: number;
            he_gi: number;
            he_dcm: number;
            retries: number;
            failed: number;
          };
          airtime: {
            rx: number;
            tx: number;
          };
          signal: number;
          noise: number;
          inactive: number;
          connected_time: number;
          thr: number;
          authorized_time: number;
          assoc_time: number;
          local_ps: boolean;
          peer_ps: boolean;
          nonpeer_ps: boolean;
          wpa: number;
          capabilities: any[];
        };
      };
    }>;
  };
}

export interface ConnectedDevice {
  hostname: string;
  ipv4: string;
  macaddr: string;
  interface: string;
  leasetime: number;
  duid?: string;
  ipv6?: string;
}

export default class SSH {
  private config: SSHConfig;

  constructor(config: SSHConfig) {
    this.config = {
      ...config,
      port: config.port || 22
    };
  }

  private async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = '';

      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          stream.on('close', (code: number) => {
            conn.end();
            if (code === 0) {
              resolve(output.trim());
            } else {
              reject(new Error(`Command exited with code ${code}`));
            }
          });

          stream.on('data', (data: Buffer) => {
            output += data.toString();
          });

          stream.stderr.on('data', (data: Buffer) => {
            console.error('SSH stderr:', data.toString());
          });
        });
      });

      conn.on('error', (err) => {
        reject(err);
      });

      conn.connect({
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        readyTimeout: 10000,
        keepaliveInterval: 1000,
        keepaliveCountMax: 3
      });
    });
  }

  async execute(command: string): Promise<string> {
    try {
      return await this.executeCommand(command);
    } catch (error) {
      console.error(`SSH command failed: ${command}`, error);
      throw error;
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const [boardInfo, systemInfo] = await Promise.all([
        this.executeCommand('ubus call system board'),
        this.executeCommand('ubus call system info')
      ]);

      const board = JSON.parse(boardInfo);
      const system = JSON.parse(systemInfo);

      // Get memory info in a more readable format
      const memoryOutput = await this.executeCommand('cat /proc/meminfo | head -4');
      const memoryLines = memoryOutput.split('\n');
      const memTotal = parseInt(memoryLines[0].match(/(\d+)/)?.[1] || '0') * 1024; // Convert from kB to bytes
      const memFree = parseInt(memoryLines[1].match(/(\d+)/)?.[1] || '0') * 1024;
      const memAvailable = parseInt(memoryLines[2].match(/(\d+)/)?.[1] || '0') * 1024;

      return {
        hostname: board.hostname || 'OpenWrt',
        uptime: system.uptime ? `${Math.floor(system.uptime / 86400)}d ${Math.floor((system.uptime % 86400) / 3600)}h ${Math.floor((system.uptime % 3600) / 60)}m` : 'Unknown',
        load: system.load ? system.load.join(' ') : 'Unknown',
        memory: {
          total: memTotal,
          free: memFree,
          available: memAvailable,
          used: memTotal - memFree
        },
        board: board,
        kernel: board.kernel || 'Unknown'
      };
    } catch (error) {
      console.error('Failed to get system info:', error);
      throw new Error(`Failed to get system info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getNetworkInterfaces(): Promise<{ interface: NetworkInterface[] }> {
    try {
      const output = await this.executeCommand('ubus call network.interface dump');
      return JSON.parse(output);
    } catch (error) {
      console.error('Failed to get network interfaces:', error);
      throw new Error(`Failed to get network interfaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWifiStatus(): Promise<WiFiStatus> {
    try {
      const output = await this.executeCommand('ubus call network.wireless status');
      return JSON.parse(output);
    } catch (error) {
      console.error('Failed to get WiFi status:', error);
      throw new Error(`Failed to get WiFi status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDHCPLeases(): Promise<{ leases: ConnectedDevice[] }> {
    try {
      const output = await this.executeCommand('ubus call dhcp ipv4leases');
      return JSON.parse(output);
    } catch (error) {
      console.error('Failed to get DHCP leases:', error);
      throw new Error(`Failed to get DHCP leases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getConnectedDevices(): Promise<ConnectedDevice[]> {
    try {
      const dhcpData = await this.getDHCPLeases();
      return dhcpData.leases || [];
    } catch (error) {
      console.error('Failed to get connected devices:', error);
      return [];
    }
  }

  async getInterfaceStatistics(): Promise<any> {
    try {
      const output = await this.executeCommand('cat /proc/net/dev');
      const lines = output.split('\n').slice(2); // Skip header lines
      const stats: any = {};

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 17) {
          const interfaceName = parts[0].replace(':', '');
          stats[interfaceName] = {
            rx_bytes: parseInt(parts[1]),
            rx_packets: parseInt(parts[2]),
            rx_errors: parseInt(parts[3]),
            rx_dropped: parseInt(parts[4]),
            tx_bytes: parseInt(parts[9]),
            tx_packets: parseInt(parts[10]),
            tx_errors: parseInt(parts[11]),
            tx_dropped: parseInt(parts[12])
          };
        }
      }

      return stats;
    } catch (error) {
      console.error('Failed to get interface statistics:', error);
      throw new Error(`Failed to get interface statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSystemLoad(): Promise<{ load1: number; load5: number; load15: number }> {
    try {
      const output = await this.executeCommand('cat /proc/loadavg');
      const loads = output.split(' ');
      return {
        load1: parseFloat(loads[0]),
        load5: parseFloat(loads[1]),
        load15: parseFloat(loads[2])
      };
    } catch (error) {
      console.error('Failed to get system load:', error);
      throw new Error(`Failed to get system load: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
