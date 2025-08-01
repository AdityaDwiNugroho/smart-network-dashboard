import { z } from 'zod';

// Device Types
export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ipAddress: z.string(),
  macAddress: z.string(),
  type: z.enum(['router', 'switch', 'iot', 'computer', 'mobile', 'other']),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  lastSeen: z.date(),
  status: z.enum(['online', 'offline', 'warning', 'error']),
  metadata: z.record(z.string()).optional(),
});

export type Device = z.infer<typeof DeviceSchema>;

// Network Metrics
export const NetworkMetricsSchema = z.object({
  timestamp: z.date(),
  deviceId: z.string(),
  bandwidth: z.object({
    upload: z.number(),
    download: z.number(),
  }),
  latency: z.number(),
  packetLoss: z.number().optional(),
});

export type NetworkMetrics = z.infer<typeof NetworkMetricsSchema>;

// Router Configuration
export const RouterConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  ipAddress: z.string(),
  sshConfig: z.object({
    username: z.string(),
    password: z.string().optional(),
    privateKey: z.string().optional(),
  }),
  snmpConfig: z.object({
    community: z.string(),
    version: z.enum(['1', '2c', '3']),
    port: z.number().default(161),
  }),
});

export type RouterConfig = z.infer<typeof RouterConfigSchema>;

// Alert Configuration
export const AlertConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['bandwidth', 'latency', 'device', 'security']),
  condition: z.object({
    metric: z.string(),
    operator: z.enum(['gt', 'lt', 'eq', 'neq']),
    value: z.number(),
  }),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  enabled: z.boolean(),
});

export type AlertConfig = z.infer<typeof AlertConfigSchema>;
