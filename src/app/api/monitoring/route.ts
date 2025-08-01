import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Standalone WebSocket server is running on port 3003
    // This API route is disabled to avoid conflicts
    return NextResponse.json({ 
      message: 'Using standalone WebSocket server',
      port: 3003,
      wsUrl: 'ws://localhost:3003',
      status: 'external'
    });
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Using external WebSocket server' },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return status for external WebSocket server
    return NextResponse.json({
      running: true,
      port: 3003,
      clients: 0, // We can't easily get client count from external server
      wsUrl: 'ws://localhost:3003',
      status: 'external'
    });
  } catch (error) {
    console.error('Monitoring status error:', error);
    return NextResponse.json(
      { error: 'Failed to get monitoring status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // External WebSocket server needs to be stopped manually
    return NextResponse.json({ 
      message: 'Please stop the external WebSocket server manually',
      note: 'Server is running in separate terminal on port 3003'
    });
  } catch (error) {
    console.error('Monitoring delete error:', error);
    return NextResponse.json(
      { error: 'Failed to stop external server' },
      { status: 500 }
    );
  }
}
