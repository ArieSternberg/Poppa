import { NextResponse } from 'next/server'
import { initNeo4j, storeConversation, getUserMetadata } from '@/lib/neo4j'
import { NotificationType } from '@/config/notificationTemplates'
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

async function processWithAgent(message: string, phoneNumber: string, templateContext?: unknown) {
  try {
    // Get user metadata including language preference
    const userMetadata = await getUserMetadata(phoneNumber)
    
    // Use environment variable to determine agent endpoint
    const agentEndpoint = process.env.AGENT_ENDPOINT || 'http://localhost:5000/ask'
    
    console.log('Calling agent at:', agentEndpoint)
    
    const response = await fetch(agentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        metadata: {
          user: userMetadata,
          templateContext,
          language: userMetadata?.profile.language || 'en'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Agent API responded with status: ${response.status}`)
    }

    const result = await response.json()
    return result.responses?.[0] || "I'm sorry, I couldn't process that message."
  } catch (error) {
    console.error('Error calling agent:', error)
    return "I'm sorry, I'm having trouble right now. Please try again later."
  }
}

export async function POST(request: Request) {
  try {
    console.log('Webhook received - Headers:', Object.fromEntries(request.headers))
    
    // Read formData once
    const formData = await request.formData()
    const params = Object.fromEntries(formData)
    
    // Log ALL incoming parameters to see what Twilio sends
    console.log('Full webhook params:', {
      ...params,
      Body: params['Body'],
      ButtonText: params['ButtonText'],
      ButtonPayload: params['ButtonPayload']
    })
    
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
    const buttonPayload = params['ButtonPayload'] as string | undefined
    const buttonText = params['ButtonText'] as string | undefined
    const templateName = params['TemplateName'] as string | undefined
    
    console.log('Message processing:', { 
      from, 
      body,
      buttonPayload,
      buttonText,
      templateName,
      isQuickReply: !!buttonPayload || !!buttonText
    })
    
    // Extract phone number from WhatsApp format
    const phoneNumber = from.replace('whatsapp:', '')

    // Check if user exists
    const userExists = await checkUserExists(phoneNumber)

    if (!userExists) {
      await sendUnregisteredUserMessage(phoneNumber)
      
      // Store conversation for unregistered user
      await storeConversation(phoneNumber, {
        message: body,
        isTemplate: false,
        templateType: NotificationType.UNREGISTERED_USER,
        response: "Hey, I'm Poppa! Visit https://poppacare.com to get started"
      })
      
      return NextResponse.json({ success: true })
    }

    // Handle special template responses that bypass agent (Welcome "Yes!" responses)
    const validWelcomePayloads = ['Yes_welcome_to_elder', 'Yes_welcome_to_ct']
    if (buttonText === 'Yes!' && validWelcomePayloads.includes(buttonPayload || '')) {
      console.log('Welcome message "Yes!" detected - bypassing agent:', {
        buttonText,
        buttonPayload,
        userType: buttonPayload?.includes('elder') ? 'Elder' : 'Caretaker'
      })
      
      // Store the template response
      await storeConversation(phoneNumber, {
        message: body,
        isTemplate: true,
        templateType: buttonPayload?.includes('elder') ? 
          NotificationType.WELCOME_ELDER : 
          NotificationType.WELCOME_CARETAKER,
        buttonResponse: buttonText && buttonPayload ? {
          text: buttonText,
          payload: buttonPayload
        } : undefined,
        response: "Great! Forward the following message to the person you want to invite"
      })

      await sendInviteFamilyMessages(phoneNumber)
      return NextResponse.json({ success: true })
    }

    // For all other messages, process through agent
    console.log('Processing message through agent...')
    
    const templateContext = templateName ? {
      templateName,
      buttonResponse: buttonText && buttonPayload ? {
        text: buttonText,
        payload: buttonPayload
      } : undefined
    } : undefined

    const agentResponse = await processWithAgent(body, phoneNumber, templateContext)

    // Store the conversation
    await storeConversation(phoneNumber, {
      message: body,
      isTemplate: !!templateName,
      templateType: templateName || undefined,
      response: agentResponse,
      buttonResponse: buttonText && buttonPayload ? {
        text: buttonText,
        payload: buttonPayload
      } : undefined
    })

    // Send agent response back to user
    await client.messages.create({
      body: agentResponse,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${phoneNumber}`,
      messagingServiceSid
    })

    console.log('Agent response sent:', agentResponse)

    return NextResponse.json({ 
      success: true,
      agentResponse,
      templateContext: !!templateContext
    })

  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
} 