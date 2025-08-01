import { NextRequest, NextResponse } from 'next/server';
import { getInfluxDB, queryNetworkMetrics } from '@/lib/influxdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const timeRange = searchParams.get('timeRange') || '1h';

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const metrics = await queryNetworkMetrics(deviceId, timeRange);
    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network metrics' },
      { status: 500 }
    );
  }
}
