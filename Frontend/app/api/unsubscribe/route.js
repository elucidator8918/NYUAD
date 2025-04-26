import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeEmail } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return new Response(`
        <html>
          <head>
            <title>Error - Email Required</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              h1 { color: #e53e3e; }
            </style>
          </head>
          <body>
            <h1>Error</h1>
            <p>Email is required to unsubscribe.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    const result = await unsubscribeEmail(email);
    
    let htmlContent;
    
    if (result.success) {
      htmlContent = `
        <html>
          <head>
            <title>Unsubscribed Successfully</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              h1 { color: #48bb78; }
            </style>
          </head>
          <body>
            <h1>Unsubscribed Successfully</h1>
            <p>You have been successfully unsubscribed from our notifications.</p>
            <p>Email: ${email}</p>
          </body>
        </html>
      `;
    } else {
      htmlContent = `
        <html>
          <head>
            <title>Unsubscribe Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              h1 { color: #e53e3e; }
            </style>
          </head>
          <body>
            <h1>Error</h1>
            <p>${result.message || 'Failed to unsubscribe'}</p>
          </body>
        </html>
      `;
    }

    return new Response(htmlContent, {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    
    return new Response(`
      <html>
        <head>
          <title>Server Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #e53e3e; }
          </style>
        </head>
        <body>
          <h1>Server Error</h1>
          <p>Sorry, we encountered an error processing your request.</p>
        </body>
      </html>
    `, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}