import { exec } from 'child_process';

export function pingHost(host: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // Use system ping for cross-platform compatibility
    const platform = process.platform;
    const countFlag = platform === 'win32' ? '-n' : '-c';
    const cmd = `ping ${countFlag} 1 ${host}`;
    exec(cmd, (error, stdout) => {
      if (error) return reject(error);
      // Parse latency from output
      const match = stdout.match(/time[=<]([0-9.]+) ?ms/);
      if (match) {
        resolve(Number(match[1]));
      } else {
        // Fallback for Windows
        const winMatch = stdout.match(/Average = ([0-9]+)ms/);
        if (winMatch) {
          resolve(Number(winMatch[1]));
        } else {
          reject(new Error('Could not parse ping output'));
        }
      }
    });
  });
}
