import { NextResponse } from "next/server";
import twilio from 'twilio'
import { NotificationType, notificationTemplates } from '@/config/notificationTemplates';
import { RedisMemory } from '@/lib/redis';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = "+13057605575";

// Initialize Redis
let memory: RedisMemory | null = null;

async function getRedisMemory() {
  if (!memory) {
    memory = new RedisMemory();
    await memory.getConnection();
  }
  return memory;
}

async function storeWelcomeMessageInRedis(phoneNumber: string, userName: string) {
  const welcomeMessage = {
    role: "agent" as const,
    content: `Hello ${userName}! 😊 I'm Poppa, your friendly virtual concierge.\nI'm here to make your life easier—helping with daily reminders, appointments, medication, and even keeping your family in the loop.\nWho in your family should we include? Feel free to invite them now so we can all stay connected! 💙`
  };
  
  try {
    const redis = await getRedisMemory();
    await redis.save(
      { thread_id: `chat:phone:${phoneNumber.replace(/[^0-9]/g, '')}` },
      [welcomeMessage]
    );
    console.log(`Successfully saved welcome message to Redis for ${userName}`);
  } catch (error) {
    console.error('Error storing welcome message in Redis:', error);
  }
}

const client = twilio(accountSid, authToken)

export async function POST(request: Request) {
  try {
    const { phoneNumber, userName } = await request.json();

    if (!phoneNumber || !userName) {
      return NextResponse.json(
        { error: "Phone number and user name are required" },
        { status: 400 }
      );
    }

    // Store welcome message in Redis before sending
    await storeWelcomeMessageInRedis(phoneNumber, userName);

    // Format phone number to include whatsapp: prefix
    const to = `whatsapp:${phoneNumber}`
    const from = `whatsapp:${fromNumber}`

    // Get the content SID from the templates
    const { contentSid } = notificationTemplates[NotificationType.WELCOME_ELDER]

    // Create the content variables object
    const contentVariables = JSON.stringify({
      1: userName
    })

    // Send the message
    const message = await client.messages.create({
      contentSid,
      from,
      to,
      contentVariables,
      messagingServiceSid
    })

    return NextResponse.json({ 
      success: true, 
      messageId: message.sid 
    })

  } catch (error) {
    console.error('Error sending welcome elder notification:', error)
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
} 