import { NextResponse } from "next/server";
import twilio from 'twilio'
import { NotificationType, notificationTemplates } from '@/config/notificationTemplates';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = "+13057605575";

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