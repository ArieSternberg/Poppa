import { NextResponse } from 'next/server'
import { getUserMetadata, getConversationHistory } from '@/lib/neo4j'

// Use ngrok tunnel URL for the agent
const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const { message, phoneNumber, templateContext } = await request.json()

    if (!message || !phoneNumber) {
      return NextResponse.json(
        { error: 'Message and phone number are required' },
        { status: 400 }
      )
    }

    // Get user metadata and conversation history
    const [userMetadata, conversationHistory] = await Promise.all([
      getUserMetadata(phoneNumber),
      getConversationHistory(phoneNumber, 10)
    ])

    // Prepare the payload for the agent
    const agentPayload = {
      text: message,
      metadata: {
        user: userMetadata,
        templateContext,
        conversationHistory: conversationHistory.reverse() // Reverse to get chronological order
      }
    }

    console.log('Sending to agent via ngrok:', {
      message,
      phoneNumber,
      agentUrl: AGENT_URL,
      hasMetadata: !!userMetadata,
      historyLength: conversationHistory.length,
      templateContext
    })

    // Forward to agent service via ngrok tunnel
    const response = await fetch(`${AGENT_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentPayload)
    })

    if (!response.ok) {
      throw new Error(`Agent service responded with status: ${response.status}`)
    }

    const agentResponse = await response.json()
    
    // Extract the response text
    const responseText = agentResponse.responses?.[0] || 
                        agentResponse.response || 
                        "I'm sorry, I couldn't process that message."

    return NextResponse.json({
      success: true,
      response: responseText,
      metadata: {
        userFound: !!userMetadata,
        historyLength: conversationHistory.length
      }
    })

  } catch (error) {
    console.error('Error calling agent via ngrok:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: "I'm sorry, I'm having trouble right now. Please try again later."
      },
      { status: 500 }
    )
  }
} 