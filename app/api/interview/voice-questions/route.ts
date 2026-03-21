import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const QUESTION_BANK: { [key: string]: { [round: string]: string[] } } = {
  'TCS/Infosys/Wipro': {
    HR: [
      "Tell me about yourself.",
      "Why do you want to join TCS?",
      "Where do you see yourself in 5 years?",
      "What are your strengths and weaknesses?",
      "Are you comfortable with relocation?",
      "Tell me about a challenge you faced and how you overcame it.",
      "Why should we hire you?",
      "What motivates you to work?",
      "Describe your ideal work environment.",
      "How do you handle work pressure and tight deadlines?"
    ],
    Technical: [
      "Explain the difference between SQL and NoSQL databases.",
      "What is Object-Oriented Programming? Explain its pillars.",
      "What is the difference between a stack and a queue?",
      "Explain what REST API is and how it works.",
      "What is the difference between process and thread?",
      "Explain normalization in databases.",
      "What is time complexity? Explain O(n) and O(log n).",
      "What is the difference between TCP and UDP?",
      "Explain how garbage collection works in Java.",
      "What is a deadlock and how do you prevent it?"
    ],
    Aptitude: [
      "If a train travels 60 km in 45 minutes, what is its speed in km/h?",
      "A can do a work in 10 days, B in 15 days. How long together?",
      "What comes next in the series: 2, 6, 12, 20, 30, ?",
      "If today is Wednesday, what day will it be after 100 days?",
      "Find the odd one out: 8, 27, 64, 100, 125"
    ]
  },
  'Amazon/Google/Microsoft': {
    Behavioral: [
      "Tell me about a time you showed leadership.",
      "Describe a situation where you had to work with a difficult team member.",
      "Tell me about your most challenging project and what you learned.",
      "Give an example of when you took initiative beyond your role.",
      "Describe a time you failed and what you did about it.",
      "Tell me about a time you had to make a decision with incomplete information.",
      "How have you handled a disagreement with your manager?",
      "Tell me about a time you had to learn something quickly under pressure."
    ],
    Technical: [
      "How would you design a URL shortener like bit.ly?",
      "Explain the concept of microservices architecture.",
      "How does a hash table work? What are collision resolution strategies?",
      "Explain the difference between BFS and DFS.",
      "How would you design a cache system?",
      "What is a binary search tree? What are its properties?",
      "Explain SOLID principles in software design.",
      "How would you optimize a slow database query?",
      "What is the difference between synchronous and asynchronous programming?",
      "Explain how you would handle millions of concurrent users."
    ]
  },
  'HR Round': {
    HR: [
      "Tell me about yourself.",
      "What are your career goals?",
      "Why are you leaving your current job?",
      "What salary are you expecting?",
      "Are you a team player or do you prefer working alone?",
      "How do you handle criticism?",
      "What is your greatest professional achievement?",
      "Do you have any questions for us?",
      "How quickly can you join if selected?",
      "Tell me about a time you went above and beyond."
    ]
  },
  'Behavioral (STAR)': {
    Behavioral: [
      "Tell me about a time you demonstrated leadership skills.",
      "Describe a situation where you resolved a conflict in your team.",
      "Tell me about a project where you showed creativity.",
      "Give an example of when you had to meet a tight deadline.",
      "Describe a time when you had to adapt to a major change.",
      "Tell me about a time you made a mistake and how you handled it.",
      "Give an example of how you prioritize tasks when everything is urgent.",
      "Describe a time you mentored or helped a colleague."
    ]
  }
}

export async function POST(req: NextRequest) {
  try {
    const { company, round, count = 5 } = await req.json()

    const companyBank = QUESTION_BANK[company] || QUESTION_BANK['TCS/Infosys/Wipro']
    const roundBank = companyBank[round] || companyBank[Object.keys(companyBank)[0]]

    // Shuffle and pick questions
    const shuffled = [...roundBank].sort(() => Math.random() - 0.5)
    const questions = shuffled.slice(0, Math.min(count, shuffled.length))

    return NextResponse.json({ success: true, questions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}