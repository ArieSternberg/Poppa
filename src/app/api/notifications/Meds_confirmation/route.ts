import { NextResponse } from "next/server";
import { getMedicationsDue, initNeo4j } from "@/lib/neo4j";
import { NotificationType, notificationTemplates } from '@/config/notificationTemplates';
import twilio from 'twilio';
import { RedisMemory } from '@/lib/redis';

// Initialize Redis
let memory: RedisMemory | null = null;

async function getRedisMemory() {
  if (!memory) {
    memory = new RedisMemory();
    await memory.getConnection(); // Ensure we're connected
  }
  return memory;
}

// Initialize Neo4j
initNeo4j();

// Debug environment variables
console.log('Debug - Environment Variables:', {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID?.slice(0, 5) + '...',
  HAS_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
  HAS_CONTENT_SID: !!process.env.TWILIO_MEDICATION_CONTENT_SID,
  HAS_MESSAGING_SERVICE_SID: !!process.env.TWILIO_MESSAGING_SERVICE_SID
});

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const contentSid = notificationTemplates[NotificationType.MEDICATION_REMINDER].contentSid;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = "+13057605575";

// Initialize Twilio client
const client = twilio(accountSid, authToken);

async function storeReminderInRedis(phoneNumber: string, medications: string[]) {
  const reminderMessage = {
    role: "agent" as const,
    content: `Hey, did you take your vitamins today?\n${medications.join('\n')}`
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

async function sendWhatsAppNotification(phoneNumber: string, medications: string[]) {
  console.log('Debug - Sending WhatsApp notification:', {
    phoneNumber,
    medications,
    accountSid,
    hasAuthToken: !!authToken,
    contentSid,
    messagingServiceSid,
    fromNumber
  });

  // Format medications with each on a new line
  const formattedMedications = medications.join('\n');

  // Store reminder in Redis before sending
  await storeReminderInRedis(phoneNumber, medications);

  // Format phone numbers for WhatsApp
  const to = `whatsapp:${phoneNumber}`;
  const from = `whatsapp:${fromNumber}`;

  // Create content variables matching the template format
  const contentVariables = JSON.stringify({
    "1": formattedMedications
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

export async function GET() {
  try {
    const now = new Date();
    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'start_check',
      timestamp: {
        currentTime: now.toISOString(),
        localTime: now.toLocaleTimeString(),
        utcTime: now.toUTCString()
      }
    }));

    // Initialize Neo4j at the start of the request
    initNeo4j();
    
    // Get all medications due in the next 15 minutes
    const medicationsDue = await getMedicationsDue(15);
    
    if (medicationsDue.length === 0) {
      console.warn('NOTIFICATION_DEBUG', JSON.stringify({
        event: 'no_medications_due',
        timestamp: new Date().toISOString()
      }));
      return NextResponse.json({ success: true, results: [] });
    }
    
    // Group medications by user
    const userMedications = new Map<string, { phone: string, medications: string[] }>();
    
    medicationsDue.forEach(med => {
      if (!userMedications.has(med.userId)) {
        userMedications.set(med.userId, { phone: med.phone, medications: [] });
      }
      userMedications.get(med.userId)?.medications.push(med.Name);
    });

    // Send notifications for each user
    const notifications = Array.from(userMedications.entries()).map(async ([userId, data]) => {
      try {
        await sendWhatsAppNotification(data.phone, data.medications);
        return { userId, status: 'success' };
      } catch (error) {
        console.error('Failed to send notification:', error);
        return { userId, status: 'error', error: error instanceof Error ? error.message : String(error) };
      }
    });

    const results = await Promise.all(notifications);
    
    console.warn('NOTIFICATION_DEBUG', JSON.stringify({
      event: 'notifications_complete',
      data: {
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