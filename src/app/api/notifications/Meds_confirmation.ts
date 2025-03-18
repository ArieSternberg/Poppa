import { NextResponse } from "next/server";
import { getMedicationsDue, initNeo4j } from "@/lib/neo4j";
import { NotificationType, notificationTemplates } from '@/config/notificationTemplates';

// Initialize Neo4j
initNeo4j();

// Debug environment variables
console.log('Debug - Environment Variables:', {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID?.slice(0, 5) + '...',
  HAS_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
  HAS_CONTENT_SID: !!process.env.TWILIO_CONTENT_SID,
  HAS_MESSAGING_SERVICE_SID: !!process.env.TWILIO_MESSAGING_SERVICE_SID
});

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const contentSid = notificationTemplates[NotificationType.MEDICATION_REMINDER].contentSid;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = "+13057605575";

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

  // Format medications with numbers (1., 2., etc.)
  const formattedMedications = medications.map((med, index) => `${index + 1}. ${med}`).join('\n');

  const contentVariables = {
    "1": formattedMedications
  };

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const formData = new URLSearchParams();
  formData.append('To', `whatsapp:${phoneNumber}`);
  formData.append('From', `whatsapp:${fromNumber}`);
  formData.append('ContentSid', contentSid!);
  formData.append('ContentVariables', JSON.stringify(contentVariables));
  formData.append('MessagingServiceSid', messagingServiceSid!);

  console.log('Debug - Request details:', {
    url,
    formData: Object.fromEntries(formData),
    hasAuth: !!auth
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData
  });

  console.log('Debug - Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Debug - Error body:', errorBody);
    throw new Error(`Failed to send WhatsApp notification: ${response.statusText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const now = new Date();
    console.log('Debug - Starting medication check at:', {
      currentTime: now.toISOString(),
      localTime: now.toLocaleTimeString(),
      utcTime: now.toUTCString()
    });
    
    // This endpoint should be called by a cron job every 15 minutes
    // Get all medications due in the next 15 minutes
    const medicationsDue = await getMedicationsDue(15);
    console.log('Debug - Medications due:', {
      count: medicationsDue.length,
      medications: medicationsDue.map(med => ({
        name: med.name,
        userId: med.userId,
        scheduledTime: med.scheduledTime
      }))
    });
    
    // Group medications by user
    const userMedications = new Map<string, { phone: string, medications: string[] }>();
    
    medicationsDue.forEach(med => {
      console.log('Debug - Processing medication:', {
        name: med.name,
        userId: med.userId,
        phone: med.phone,
        scheduledTime: med.scheduledTime
      });
      
      if (!userMedications.has(med.userId)) {
        userMedications.set(med.userId, { phone: med.phone, medications: [] });
      }
      userMedications.get(med.userId)?.medications.push(med.name);
    });

    console.log('Debug - Grouped medications by user:', {
      userCount: userMedications.size,
      users: Array.from(userMedications.entries()).map(([userId, data]) => ({
        userId,
        phone: data.phone,
        medicationCount: data.medications.length,
        medications: data.medications
      }))
    });

    // Send notifications for each user
    const notifications = Array.from(userMedications.entries()).map(async ([userId, data]) => {
      try {
        console.log('Debug - Attempting to send notification:', {
          userId,
          phone: data.phone,
          medications: data.medications
        });
        
        await sendWhatsAppNotification(data.phone, data.medications);
        console.log('Debug - Successfully sent notification to:', userId);
        return { userId, status: 'success' };
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        return { userId, status: 'error', error };
      }
    });

    const results = await Promise.all(notifications);
    console.log('Debug - Notification results:', results);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error in notification service:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 