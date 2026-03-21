import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Hardcoded questions until Claude API key is added
const questionBank: Record<string, Record<string, string[]>> = {
  'TCS': {
    'Technical': [
      'What is the difference between stack and queue?',
      'Explain OOPS concepts with examples.',
      'What is normalization in databases?',
      'What is the difference between TCP and UDP?',
      'Explain the concept of recursion.',
      'What is a foreign key in SQL?',
      'What is the difference between abstract class and interface?',
      'What is REST API?',
      'Explain time complexity of sorting algorithms.',
      'What is the difference between process and thread?'
    ],
    'HR': [
      'Tell me about yourself.',
      'Why do you want to join TCS?',
      'Where do you see yourself in 5 years?',
      'What are your strengths and weaknesses?',
      'Are you willing to relocate?',
      'How do you handle pressure?',
      'Tell me about a time you worked in a team.',
      'What do you know about TCS?',
      'Why should we hire you?',
      'Do you have any questions for us?'
    ],
    'Aptitude': [
      'If a train travels 60 km in 1 hour, how far will it travel in 2.5 hours?',
      'What is 15% of 240?',
      'Find the next number: 2, 4, 8, 16, __',
      'A shopkeeper buys at 100 and sells at 120. What is the profit %?',
      'If 5 workers complete a job in 10 days, how many days for 10 workers?',
      'What comes next: A, C, E, G, __?',
      'Find the odd one out: Cat, Dog, Bird, Fish, Tiger',
      'If today is Monday, what day is it after 100 days?',
      'A cistern is filled in 6 hours and emptied in 8 hours. How long to fill if both are open?',
      'Simplify: (25 × 4) ÷ (5 × 2)'
    ],
    'Mixed': [
      'Tell me about yourself.',
      'What is OOPS?',
      'Why TCS?',
      'What is normalization?',
      'What are your strengths?',
      'What is the difference between stack and queue?',
      'Where do you see yourself in 5 years?',
      'What is REST API?',
      'Are you willing to relocate?',
      'What is time complexity?'
    ]
  },
  'Infosys': {
    'Technical': [
      'What is polymorphism?',
      'Explain MVC architecture.',
      'What is the difference between SQL and NoSQL?',
      'What is Git and how do you use it?',
      'Explain the SDLC process.',
      'What is a deadlock?',
      'What is cloud computing?',
      'What is agile methodology?',
      'Explain inner join vs outer join.',
      'What is the difference between ArrayList and LinkedList?'
    ],
    'HR': [
      'Tell me about yourself.',
      'Why Infosys?',
      'What motivates you?',
      'Tell me about your final year project.',
      'How do you handle failure?',
      'Describe yourself in 3 words.',
      'What are your career goals?',
      'Tell me about a challenge you overcame.',
      'Why should we hire you over others?',
      'Do you prefer working alone or in a team?'
    ],
    'Aptitude': [
      'A car travels 120 km at 40 km/h. Find the time taken.',
      'What is 20% of 350?',
      'Find the HCF of 12 and 18.',
      'If 3x + 5 = 20, find x.',
      'A man walks 5 km north, then 3 km east. Find distance from start.',
      'What is the next prime after 13?',
      'A pipe fills a tank in 4 hours. How much fills in 1.5 hours?',
      'Find the average of 10, 20, 30, 40, 50.',
      'What is 12 squared?',
      'If a = 3 and b = 4, find a² + b².'
    ],
    'Mixed': [
      'Tell me about yourself.',
      'What is polymorphism?',
      'Why Infosys?',
      'What is cloud computing?',
      'What motivates you?',
      'Explain MVC architecture.',
      'What are your goals?',
      'What is agile?',
      'How do you handle pressure?',
      'What is Git?'
    ]
  },
  'General': {
    'Technical': [
      'What programming languages do you know?',
      'Explain object oriented programming.',
      'What is the difference between frontend and backend?',
      'What is a database?',
      'What is version control?',
      'Explain what an API is.',
      'What is debugging?',
      'What is the difference between compiled and interpreted languages?',
      'What is a data structure?',
      'Explain the concept of inheritance.'
    ],
    'HR': [
      'Tell me about yourself.',
      'What are your strengths?',
      'What is your biggest weakness?',
      'Why do you want this job?',
      'Where do you see yourself in 5 years?',
      'How do you handle stress?',
      'Tell me about a time you showed leadership.',
      'What do you know about our company?',
      'Why should we hire you?',
      'Do you have any questions for us?'
    ],
    'Aptitude': [
      'What is 25% of 200?',
      'If 6 apples cost ₹30, how much do 10 cost?',
      'Find the next: 1, 4, 9, 16, __',
      'A train covers 100 km in 2 hours. Find speed.',
      'What is the LCM of 4 and 6?',
      'If today is Wednesday, what day after 10 days?',
      'Find the odd one out: 2, 3, 4, 6, 9',
      'A rectangle is 10×5. Find the area.',
      'What is 3/4 as a percentage?',
      'Simplify: 100 ÷ 4 + 3 × 2'
    ],
    'Mixed': [
      'Tell me about yourself.',
      'What are your technical skills?',
      'Why do you want this job?',
      'What is OOP?',
      'What are your strengths?',
      'What is an API?',
      'Where do you see yourself in 5 years?',
      'What is version control?',
      'How do you handle pressure?',
      'Do you have any questions for us?'
    ]
  }
}

const modelAnswers: Record<string, string> = {
  'Tell me about yourself.': 'I am a passionate and hardworking fresher with a degree in Computer Science. During my college years I built strong skills in programming, problem solving and teamwork through projects and internships. I am eager to apply my knowledge in a professional environment and grow with a great company like this.',
  'What are your strengths?': 'My key strengths are quick learning ability, strong problem solving skills and dedication to deliver quality work. I am also a good team player and communicate effectively with my peers.',
  'Why do you want to join TCS?': 'TCS is one of India\'s most respected IT companies with a global presence and excellent learning opportunities. I want to grow my technical skills, work on large scale projects and build a strong career foundation with TCS.',
  'What is the difference between stack and queue?': 'A stack follows LIFO (Last In First Out) principle where the last element added is the first to be removed, like a stack of plates. A queue follows FIFO (First In First Out) where the first element added is the first removed, like a queue at a ticket counter.',
  'What is OOPS?': 'Object Oriented Programming is a programming paradigm based on objects. It has four main concepts: Encapsulation (hiding data inside objects), Inheritance (child class inheriting from parent), Polymorphism (same method behaving differently), and Abstraction (hiding complex implementation).'
}

function getQuestions(company: string, roundType: string): {
  question: string
  model_answer: string
  key_points: string[]
}[] {
  const companyData = questionBank[company] || questionBank['General']
  const questions = companyData[roundType] || companyData['Mixed']

  return questions.map(q => ({
    question: q,
    model_answer: modelAnswers[q] || `This is a great question for ${roundType} round. Structure your answer clearly, give specific examples from your experience or projects, and keep it concise and confident. Practice answering in 1-2 minutes.`,
    key_points: [
      'Be specific and give examples',
      'Keep answer under 2 minutes',
      'Show enthusiasm and confidence',
      'Relate to the company and role'
    ]
  }))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, company, role, roundType } = body

    if (!userId || !company || !role || !roundType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try to get questions from PDF database first
    let questions: Array<{ question: string; model_answer: string; key_points: string[]; source?: string }> = []

    try {
      const { data: pdfQuestions } = await supabase
        .from('pdf_questions')
        .select('*')
        .eq('active', true)
        .or(`company.eq.${company},company.eq.General`)
        .eq('round_type', roundType)
        .limit(10)

      if (pdfQuestions && pdfQuestions.length > 0) {
        // Use PDF questions — shuffle and pick 10
        const shuffled = pdfQuestions.sort(() => Math.random() - 0.5).slice(0, 10)
        questions = shuffled.map(q => ({
          question: q.question,
          model_answer: q.model_answer,
          key_points: q.key_points || [],
          source: 'pdf'
        }))
      }
    } catch (err) {
      console.log('PDF questions fetch failed, using hardcoded:', err)
    }

    // Fall back to hardcoded questions if no PDF questions
    if (questions.length === 0) {
      questions = getQuestions(company, roundType)
    }

    // Save session to Supabase
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: userId,
        company,
        role,
        round_type: roundType,
        questions,
        score: 0
      })
      .select()
      .single()

    if (error) console.error('Supabase error:', error)

    return NextResponse.json({
      success: true,
      questions,
      sessionId: data?.id,
      source: questions[0]?.source === 'pdf' ? 'Your uploaded PDFs' : 'Default question bank'
    })

  } catch (error) {
    console.error('Interview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions.' },
      { status: 500 }
    )
  }
}