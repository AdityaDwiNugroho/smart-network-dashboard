import { NextResponse } from 'next/server';
import { NetworkMonitor } from '@/lib/networkMonitor';

export async function POST() {
  try {
    const monitor = NetworkMonitor.getInstance();
    await monitor.startMonitoring();
    return NextResponse.json({ status: 'Monitoring started' });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to start monitoring' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const monitor = NetworkMonitor.getInstance();
    monitor.stopMonitoring();
    return NextResponse.json({ status: 'Monitoring stopped' });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to stop monitoring' },
      { status: 500 }
    );
  }
}
