// app/api/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendNotifications } from '@/lib/emailService';

// Secret key to protect the endpoint from unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;
const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV; // 'development' or 'production'

export async function POST(request: NextRequest) {
  // Validate authorization
  const authHeader = request.headers.get('authorization');

  const isAuthorized = 
    NODE_ENV === 'development' || 
    (authHeader && authHeader === `Bearer ${CRON_SECRET}`);

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
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