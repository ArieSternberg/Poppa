import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { notificationTemplates, NotificationType } from '@/config/notificationTemplates'
import { RedisMemory } from '@/lib/redis';

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
const fromNumber = '+13057605575'

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
    content: `Welcome ${userName}! 😊 I'm Poppa, your friendly virtual concierge.\n\nI'm here to support you and your parents, and bring peace of mind to families like yours. Think of me as a helpful companion—managing reminders, appointments, and keeping everyone connected.\n\nWho in your family should we include? Maybe siblings or parents\nWould you like to invite them now so we can all stay connected! 💙`
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
    const { userName, phoneNumber } = await request.json()

    if (!userName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store welcome message in Redis before sending
    await storeWelcomeMessageInRedis(phoneNumber, userName);

    // Format phone number to include whatsapp: prefix
    const to = `whatsapp:${phoneNumber}`
    const from = `whatsapp:${fromNumber}`

    // Get the content SID from the templates
    const { contentSid } = notificationTemplates[NotificationType.WELCOME_CARETAKER]

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
    console.error('Error sending welcome caretaker notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
} 