// app/api/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendNotifications } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    system: "operational",
    activeSensors: 9,
    totalSensors: 12,
    minorAnomalies: 1,
    criticalAlerts: 0,
    lastUpdated: new Date().toISOString(), // updated dynamically
  });
}

export async function POST(request: NextRequest) {
  try {
    const result = await sendNotifications();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message || `Successfully sent notifications` 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send notifications',
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Notification cron error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process notification request',
      error: error.message
    }, { status: 500 });
  }
}
