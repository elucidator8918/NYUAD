"use server"

import { PrismaClient } from '@prisma/client';
import { z } from "zod";
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();
// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY as string);

const EmailSchema = z.string().email("Invalid email address");

export async function subscribeEmail(email: string) {
  try {
    const parsedEmail = EmailSchema.parse(email);
    
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: parsedEmail },
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        await prisma.subscriber.update({
          where: { email: parsedEmail },
          data: { isActive: true },
        });
        return { success: true, message: 'Subscription reactivated' };
      }
      return { success: true, message: 'Already subscribed' };
    }

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
    
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: parsedEmail },
    });

    if (!subscriber) {
      return { success: false, message: 'Email not found' };
    }

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
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
    });

    if (subscribers.length === 0) {
      console.log('No active subscribers found');
      return { success: true, count: 0, message: 'No active subscribers found' };
    }

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const subject = `CRITICAL ALERT: Earthquake Detection - ${currentDate}`;
    
    let sentCount = 0;
    
    // Send individual emails to each subscriber
    for (const subscriber of subscribers) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>CRITICAL ALERT: Earthquake Detection</h2>
          <p>This is an urgent notification sent at ${currentTime} on ${currentDate}.</p>
          <p><strong>Critical alerts regarding earthquake detection in your monitored area.</strong></p>
          <p>Please check the monitoring system dashboard for more details and follow your organization's emergency protocols.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            You're receiving this email because you subscribed to notifications. 
            To unsubscribe, <a href="${process.env.NEXT_PUBLIC_URL}/api/subscribe/unsubscribe?email=${subscriber.email}">click here</a>.
          </p>
        </div>
      `;

      const textContent = `CRITICAL ALERT: Earthquake Detection - ${currentDate}. Critical alerts regarding earthquake detection in your monitored area. Please check the monitoring system dashboard for more details and follow your organization's emergency protocols.`;

      try {
        // Using SendGrid instead of Resend
        const msg = {
          to: subscriber.email,
          from: 'miqdadyayah0@gmail.com',
          subject: subject,
          text: textContent,
          html: html,
        };
        
        await sgMail.send(msg);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${subscriber.email}:`, emailError);
      }
    }

    await prisma.notificationLog.create({
      data: {
        batchSize: sentCount,
        success: true,
      },
    });

    return { 
      success: true, 
      count: sentCount, 
      message: `Successfully sent notifications to ${sentCount} subscribers` 
    };
  } catch (error: any) {
    console.error('Failed to send notifications:', error);
    
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
