export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.log('WhatsApp credentials not configured yet')
    return false
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message }
        })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('WhatsApp send error:', data)
      return false
    }

    console.log('WhatsApp message sent to:', phone)
    return true

  } catch (error) {
    console.error('WhatsApp error:', error)
    return false
  }
}

// Send to multiple users
export async function sendWhatsAppToMany(
  users: { phone: string; message: string }[]
): Promise<void> {
  for (const user of users) {
    await sendWhatsAppMessage(user.phone, user.message)
    // Small delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Format daily questions message
export function formatDailyQuestions(jobRole: string, questions: string): string {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return `🎯 *Daily Interview Questions — ${date}*\n\n👔 *Role: ${jobRole}*\n\n${questions}\n\n💡 _Practice answering these out loud for best results!_\n\n🚀 *AI Resume Coach* — Your daily prep partner`
}