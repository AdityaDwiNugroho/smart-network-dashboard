import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DeviceSchema } from '@/types';

// Mock data - replace with actual database queries
const mockDevices = [
  {
    id: '1',
    name: 'Main Router',
    ipAddress: '192.168.1.1',
    macAddress: '00:11:22:33:44:55',
    type: 'router',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: '2',
    name: 'Living Room TV',
    ipAddress: '192.168.1.101',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    type: 'iot',
    status: 'online',
    lastSeen: new Date(),
  },
];

export async function GET() {
  try {
    // Validate the mock data against our schema
    const devices = z.array(DeviceSchema).parse(mockDevices);
    
    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const device = DeviceSchema.parse(body);
    
    // TODO: Save device to database
    mockDevices.push(device);
    
    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 400 }
    );
  }
}
