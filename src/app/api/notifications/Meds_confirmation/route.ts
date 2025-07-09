import { NextResponse } from "next/server";
import { getUsersWithMedicationsInWindow, initNeo4j } from "@/lib/neo4j";
import { NotificationType, notificationTemplates } from '@/config/notificationTemplates';
import twilio from 'twilio';
import { RedisMemory } from '@/lib/redis';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// Initialize Redis
let memory: RedisMemory | null = null;

// Define the timezone we're using (EST)
const TIMEZONE = 'America/New_York';

async function getRedisMemory() {
  if (!memory) {
    memory = new RedisMemory();
    await memory.getConnection();
  }
  return memory;
}

// Initialize Neo4j
initNeo4j();

// Debug environment variables
console.log('Debug - Environment Variables:', {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID?.slice(0, 5) + '...',
  HAS_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
  HAS_AM_CONTENT_SID: !!process.env.TWILIO_MED_CONFIRMATION_AM_SID,
  HAS_PM_CONTENT_SID: !!process.env.TWILIO_MED_CONFIRMATION_PM_SID,
  HAS_MESSAGING_SERVICE_SID: !!process.env.TWILIO_MESSAGING_SERVICE_SID
});

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = "+13057605575";

// Initialize Twilio client
const client = twilio(accountSid, authToken);

async function storeReminderInRedis(phoneNumber: string, timeWindow: 'AM' | 'PM') {
  const reminderMessage = {
    role: "agent" as const,
    content: `Did you take your ${timeWindow === 'AM' ? 'morning' : 'afternoon'} medication?`
  };
  
  try {
    const redis = await getRedisMemory();
    await redis.save(
      { thread_id: `chat:phone:${phoneNumber.replace(/[^0-9]/g, '')}` },
      [reminderMessage]
    );
  } catch (error) {
    console.error('Error storing reminder in Redis:', error);
  }
}

async function sendWhatsAppNotification(user: { firstName: string, phone: string }, timeWindow: 'AM' | 'PM') {
  console.log('Debug - Sending WhatsApp notification:', {
    firstName: user.firstName,
    phone: user.phone,
    timeWindow,
    accountSid,
    hasAuthToken: !!authToken,
    messagingServiceSid,
    fromNumber
  });

  // Store reminder in Redis before sending
  await storeReminderInRedis(user.phone, timeWindow);

  // Format phone numbers for WhatsApp
  const to = `whatsapp:${user.phone}`;
  const from = `whatsapp:${fromNumber}`;

  // Get the appropriate template for AM/PM
  const templateType = timeWindow === 'AM' 
    ? NotificationType.MEDICATION_CONFIRMATION_AM 
    : NotificationType.MEDICATION_CONFIRMATION_PM;
  
  // Get the content SID from the templates
  const { contentSid } = notificationTemplates[templateType];

  // Create content variables with user's first name
  const contentVariables = JSON.stringify({
    "1": user.firstName
  });

  try {
    const message = await client.messages.create({
      contentSid,
      from,
      to,
      contentVariables,
      messagingServiceSid
    });

    console.log('Debug - Message sent successfully:', {
      messageId: message.sid,
      status: message.status
    });

    return message;
  } catch (error) {
    console.error('Debug - Error sending message:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const now = new Date();
    const url = new URL(request.url);
    const testMode = url.searchParams.get('test');
    const testTime = url.searchParams.get('time');
    
    // Convert UTC to EST for time comparison
    const estNow = toZonedTime(now, TIMEZONE);
    let currentHour = estNow.getHours();
    let currentMinute = estNow.getMinutes();

    // Override time if in test mode
    if (testMode === 'true' && testTime) {
      const [hour, minute] = testTime.split(':').map(Number);
      currentHour = hour;
      currentMinute = minute;
      console.log('Test mode activated with time:', testTime);
    }

    // Determine if it's AM or PM check time
    let timeWindow: 'AM' | 'PM' | null = null;
    if (currentHour === 11 && currentMinute === 59) {
      timeWindow = 'AM';
    } else if (currentHour === 22 && currentMinute === 0) {
      timeWindow = 'PM';
    }

    // Allow forcing time window in test mode
    if (testMode === 'true' && !timeWindow) {
      timeWindow = currentHour < 12 ? 'AM' : 'PM';
    }

    if (!timeWindow) {
      return NextResponse.json({ 
        success: true, 
        message: "Not medication check time" 
      });
    }

    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'start_check',
      data: {
        timeWindow,
        currentTime: now.toISOString(),
        estTime: formatInTimeZone(estNow, TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
        localTime: formatInTimeZone(estNow, TIMEZONE, 'h:mm:ss a')
      }
    }));

    // Get all users who have medications in the current time window
    const usersWithMeds = await getUsersWithMedicationsInWindow(timeWindow);
    
    if (usersWithMeds.length === 0) {
      console.warn('NOTIFICATION_DEBUG', JSON.stringify({
        event: 'no_users_with_medications',
        timestamp: new Date().toISOString()
      }));
      return NextResponse.json({ success: true, results: [] });
    }

    // Send notifications to each user
    const notifications = usersWithMeds.map(async (user) => {
      try {
        await sendWhatsAppNotification(user, timeWindow!);
        return { userId: user.userId, status: 'success' };
      } catch (error) {
        console.error('Failed to send notification:', error);
        return { 
          userId: user.userId, 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        };
      }
    });

    const results = await Promise.all(notifications);
    
    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'notifications_complete',
      data: {
        timeWindow,
        totalUsers: results.length,
        successCount: results.filter(r => r.status === 'success').length,
        errorCount: results.filter(r => r.status === 'error').length,
        results
      }
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error in notification service:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
} 