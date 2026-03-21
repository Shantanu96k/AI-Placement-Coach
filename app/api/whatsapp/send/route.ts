import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage, formatDailyQuestions } from '@/lib/whatsapp'

// List of questions for each role
// (We use hardcoded questions until Claude API key is added)
const questionsByRole: Record<string, string[]> = {
  'Software Engineer': [
    'Q1. What is the difference between Array and LinkedList?',
    'Q2. Explain OOP concepts with real examples.',
    'Q3. What is the difference between SQL and NoSQL?',
    'Q4. What is REST API? How does it work?',
    'Q5. Explain the concept of recursion with an example.',
    'Q6. What is the time complexity of binary search?',
    'Q7. What is Git and why do we use it?',
    'Q8. Explain the difference between GET and POST requests.',
    'Q9. What is a deadlock? How can it be prevented?',
    'Q10. Where do you see yourself in 5 years?'
  ],
  'Data Analyst': [
    'Q1. What is the difference between mean, median and mode?',
    'Q2. Explain what a JOIN is in SQL with an example.',
    'Q3. What is data normalization?',
    'Q4. What tools have you used for data visualization?',
    'Q5. What is the difference between supervised and unsupervised learning?',
    'Q6. How do you handle missing data in a dataset?',
    'Q7. What is a pivot table and when would you use it?',
    'Q8. Explain what an outlier is and how to detect it.',
    'Q9. What is the difference between correlation and causation?',
    'Q10. Tell me about a data project you have worked on.'
  ],
  'HR Executive': [
    'Q1. Tell me about yourself.',
    'Q2. Why do you want to work in HR?',
    'Q3. How do you handle a conflict between two employees?',
    'Q4. What is your approach to recruitment?',
    'Q5. How do you ensure employee engagement?',
    'Q6. What HR tools and software have you used?',
    'Q7. How do you handle a difficult employee?',
    'Q8. What is your understanding of labor laws in India?',
    'Q9. How do you measure the success of an HR initiative?',
    'Q10. Where do you see HR heading in the next 5 years?'
  ],
  'default': [
    'Q1. Tell me about yourself.',
    'Q2. What are your greatest strengths?',
    'Q3. What is your biggest weakness?',
    'Q4. Why do you want to join our company?',
    'Q5. Where do you see yourself in 5 years?',
    'Q6. Describe a challenging situation and how you handled it.',
    'Q7. What motivates you at work?',
    'Q8. How do you handle pressure and deadlines?',
    'Q9. What do you know about our company?',
    'Q10. Do you have any questions for us?'
  ]
}

function getQuestionsForRole(jobRole: string): string {
  const questions = questionsByRole[jobRole] ||
    questionsByRole['default']
  return questions.join('\n\n')
}

// This runs every day at 8 PM IST via Vercel Cron
export async function GET(req: NextRequest) {
  try {
    // Security check — only allow Vercel cron or manual trigger
    const authHeader = req.headers.get('authorization')
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all active WhatsApp users
    const { data: users, error } = await supabase
      .from('whatsapp_users')
      .select('*')
      .eq('active', true)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active WhatsApp users found',
        sent: 0
      })
    }

    console.log(`Sending daily questions to ${users.length} students...`)

    let successCount = 0
    let failCount = 0

    // Send questions to each student
    for (const user of users) {
      const questions = getQuestionsForRole(user.job_role)
      const message = formatDailyQuestions(user.job_role, questions)

      const sent = await sendWhatsAppMessage(user.phone, message)

      if (sent) {
        successCount++
        // Update last_sent_at
        await supabase
          .from('whatsapp_users')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('id', user.id)
      } else {
        failCount++
      }

      // Small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`Done! Sent: ${successCount}, Failed: ${failCount}`)

    return NextResponse.json({
      success: true,
      message: `Daily questions sent!`,
      sent: successCount,
      failed: failCount,
      total: users.length
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

// Manual trigger for testing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, jobRole } = body

    if (!phone || !jobRole) {
      return NextResponse.json(
        { error: 'Missing phone or jobRole' },
        { status: 400 }
      )
    }

    const questions = getQuestionsForRole(jobRole)
    const message = formatDailyQuestions(jobRole, questions)

    const sent = await sendWhatsAppMessage(phone, message)

    if (sent) {
      return NextResponse.json({
        success: true,
        message: 'Test message sent! Check your WhatsApp.'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send. Check WhatsApp credentials.' },
        { status: 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    )
  }
}