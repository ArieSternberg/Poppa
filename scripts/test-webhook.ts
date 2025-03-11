import fetch from 'node-fetch'

async function testWebhook() {
  try {
    console.log('\nTesting unregistered user flow...')
    const unregisteredResponse = await fetch('http://localhost:3000/api/webhook/twilio', {
      method: 'POST',
      body: new URLSearchParams({
        'From': 'whatsapp:+1234567890',
        'Body': 'Hello'
      })
    })
    console.log('Unregistered user response:', await unregisteredResponse.json())

    console.log('\nTesting invite flow...')
    const inviteResponse = await fetch('http://localhost:3000/api/webhook/twilio', {
      method: 'POST',
      body: new URLSearchParams({
        'From': 'whatsapp:+1234567890',
        'Body': 'Yes!'
      })
    })
    console.log('Invite flow response:', await inviteResponse.json())
  } catch (error) {
    console.error('Error testing webhook:', error)
  }
}

testWebhook() 