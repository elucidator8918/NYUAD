"use server"

import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { z } from "zod";

const prisma = new PrismaClient();
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

const EmailSchema = z.string().email("Invalid email address");

export async function subscribeEmail(email: string) {
  try {
    // Validate email
    const parsedEmail = EmailSchema.parse(email);
    
    // Check if email already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: parsedEmail },
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        // Reactivate if previously unsubscribed
        await prisma.subscriber.update({
          where: { email: parsedEmail },
          data: { isActive: true },
        });
        return { success: true, message: 'Subscription reactivated' };
      }
      return { success: true, message: 'Already subscribed' };
    }

    // Create new subscriber
    await prisma.subscriber.create({
      data: { email: parsedEmail },
    });

    return { success: true, message: 'Subscribed successfully' };
  } catch (error: any) {
    console.error('Subscription error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'Failed to subscribe' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function unsubscribeEmail(email: string) {
  try {
    const parsedEmail = EmailSchema.parse(email);
    
    // Check if subscriber exists
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: parsedEmail },
    });

    if (!subscriber) {
      return { success: false, message: 'Email not found' };
    }

    // Update subscriber to inactive
    await prisma.subscriber.update({
      where: { email: parsedEmail },
      data: { isActive: false },
    });

    return { success: true, message: 'Unsubscribed successfully' };
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'Failed to unsubscribe' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function sendNotifications() {
  try {
    // Get all active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
    });

    if (subscribers.length === 0) {
      console.log('No active subscribers found');
      return { success: true, count: 0, message: 'No active subscribers found' };
    }

    const emails = subscribers.map(subscriber => subscriber.email);
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // Generate notification content
    const subject = `System Notification - ${currentDate}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>System Notification</h2>
        <p>This is an automated notification sent at ${currentTime} on ${currentDate}.</p>
        <p>Your system is running normally.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          You're receiving this email because you subscribed to notifications. 
          To unsubscribe, <a href="${process.env.NEXT_PUBLIC_URL}/api/subscribe/unsubscribe?email={email}">click here</a>.
        </p>
      </div>
    `;

    // Send emails in batches of 50
    let sentCount = 0;
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      
      await resend.emails.send({
        from: 'notifications@yourdomain.com',
        bcc: batch,
        subject: subject,
        html: html,
      });
      
      sentCount += batch.length;
    }

    // Log the notification
    await prisma.notificationLog.create({
      data: {
        batchSize: emails.length,
        success: true,
      },
    });

    return { 
      success: true, 
      count: emails.length, 
      message: `Successfully sent notifications to ${emails.length} subscribers` 
    };
  } catch (error: any) {
    console.error('Failed to send notifications:', error);
    
    // Log the error
    await prisma.notificationLog.create({
      data: {
        batchSize: 0,
        success: false,
        error: error.message,
      },
    });
    
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}