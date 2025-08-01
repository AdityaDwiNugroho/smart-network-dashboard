import { z } from 'zod';
import { create } from 'zustand';

// Device Schema
const deviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ipAddress: z.string(),
  macAddress: z.string(),
  type: z.enum(['router', 'switch', 'iot', 'computer', 'mobile', 'other']),
  status: z.enum(['online', 'offline', 'warning', 'error']),
  lastSeen: z.date(),
});

type Device = z.infer<typeof deviceSchema>;

interface DeviceState {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
}

export const useDeviceStore = create<DeviceState>()((set) => ({
  devices: [],
  addDevice: (device) =>
    set((state) => ({
      devices: [...state.devices, device],
    })),
  removeDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((device) => device.id !== id),
    })),
  updateDevice: (id, updatedDevice) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id ? { ...device, ...updatedDevice } : device
      ),
    })),
}));
