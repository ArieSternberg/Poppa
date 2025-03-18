import { NextResponse } from 'next/server'
import { initNeo4j } from '@/lib/neo4j'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
const fromNumber = '+13057605575'

const client = twilio(accountSid, authToken)

// Initialize Neo4j
initNeo4j()

async function checkUserExists(phoneNumber: string): Promise<boolean> {
  const driver = initNeo4j()
  const session = driver.session()
  try {
    const result = await session.run(
      'MATCH (u:User {phone: $phone}) RETURN u',
      { phone: phoneNumber }
    )
    return result.records.length > 0
  } finally {
    await session.close()
  }
}

async function sendUnregisteredUserMessage(to: string) {
  const message = "Hey, I'm Poppa! Visit https://poppacare.com to get started"
  await client.messages.create({
    body: message,
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:${to}`,
    messagingServiceSid
  })
}

async function sendInviteFamilyMessages(to: string) {
  // Send first message
  await client.messages.create({
    body: "Great! Forward the following message to the person you want to invite",
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:${to}`,
    messagingServiceSid
  })

  // Send second message
  await client.messages.create({
    body: "https://wa.me/13057605575?text=Hello,%20Send%20this%20to%20get%20started%20with%20Poppa",
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:${to}`,
    messagingServiceSid
  })
}

export async function POST(request: Request) {
  try {
    console.log('Webhook received - Headers:', Object.fromEntries(request.headers))
    
    // Read formData once
    const formData = await request.formData()
    const params = Object.fromEntries(formData)
    console.log('Webhook params:', params)
    
    // Validate Twilio request signature in production
    if (process.env.NODE_ENV === 'production') {
      const url = 'https://poppa-sigma.vercel.app/api/webhook/twilio'
      const twilioSignature = request.headers.get('x-twilio-signature')
      console.log('Twilio signature validation:', { 
        twilioSignature, 
        hasAuthToken: !!authToken,
        url 
      })
      
      if (!twilioSignature || !authToken) {
        console.error('Missing Twilio signature or auth token')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const isValidRequest = twilio.validateRequest(
        authToken,
        twilioSignature,
        url,
        params
      )
      console.log('Signature validation result:', isValidRequest)

      if (!isValidRequest) {
        console.error('Invalid Twilio signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const from = params['From'] as string
    const body = params['Body'] as string
    console.log('Processing message:', { from, body })
    
    // Extract phone number from WhatsApp format
    const phoneNumber = from.replace('whatsapp:', '')

    // Check if user exists
    const userExists = await checkUserExists(phoneNumber)

    if (!userExists) {
      await sendUnregisteredUserMessage(phoneNumber)
      return NextResponse.json({ success: true })
    }

    // Handle "Yes!" response for invite flow
    if (body?.toLowerCase().includes('yes')) {
      await sendInviteFamilyMessages(phoneNumber)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
} 