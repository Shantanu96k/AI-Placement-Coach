import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function generateResume(
  name: string,
  email: string,
  phone: string,
  skills: string,
  experience: string,
  education: string,
  projects: string,
  targetRole: string,
  targetCompany: string
): Promise<string> {

  const prompt = `
You are an expert resume writer specializing in the Indian job market.
Create a professional ATS-friendly resume for this candidate.

CANDIDATE DETAILS:
Name: ${name}
Email: ${email}
Phone: ${phone}
Skills: ${skills}
Work Experience: ${experience}
Education: ${education}
Projects: ${projects}
Target Role: ${targetRole}
Target Company: ${targetCompany}

INSTRUCTIONS:
- Format for Indian HR expectations and Naukri/LinkedIn ATS systems
- Use strong action verbs (Developed, Built, Optimized, Led, Achieved)
- Quantify achievements wherever possible
- Keep it to 1 page
- Include sections: SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS
- Tailor summary specifically for ${targetCompany} and ${targetRole}

Return ONLY the resume content in clean plain text.
Use clear section headers like SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS.
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].type === 'text'
    ? response.content[0].text : ''
}

export async function checkATSScore(
  resumeText: string,
  jobDescription: string
): Promise<{
  score: number
  matched_keywords: string[]
  missing_keywords: string[]
  suggestions: string[]
}> {

  const prompt = `
You are an ATS system used by top Indian companies like TCS, Infosys, Wipro.

Analyze this resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a valid JSON object — no extra text, no markdown:
{
  "score": <number 0-100>,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].type === 'text'
    ? response.content[0].text : '{}'

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      score: 0,
      matched_keywords: [],
      missing_keywords: [],
      suggestions: ['Could not analyze. Please try again.']
    }
  }
}

export async function generateInterviewQuestions(
  company: string,
  role: string,
  roundType: string,
  count: number = 10
): Promise<{
  question: string
  model_answer: string
  key_points: string[]
}[]> {

  const prompt = `
Generate ${count} realistic interview questions for:
Company: ${company}
Role: ${role}
Round: ${roundType}

Base these on actual ${company} interview patterns in India.

Return ONLY a valid JSON array — no extra text:
[
  {
    "question": "question here",
    "model_answer": "strong 3-4 sentence answer",
    "key_points": ["point1", "point2", "point3"]
  }
]
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].type === 'text'
    ? response.content[0].text : '[]'

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  role: string
): Promise<{
  score: number
  feedback: string
  better_answer: string
  strengths: string[]
  improvements: string[]
}> {

  const prompt = `
You are a senior HR interviewer hiring for ${role} at a top Indian company.

QUESTION: ${question}
CANDIDATE ANSWER: ${userAnswer}

Return ONLY a valid JSON object — no extra text:
{
  "score": <number 1-10>,
  "feedback": "2-3 sentence overall feedback",
  "better_answer": "improved version of their answer",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].type === 'text'
    ? response.content[0].text : '{}'

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      score: 0,
      feedback: 'Could not evaluate. Please try again.',
      better_answer: '',
      strengths: [],
      improvements: []
    }
  }
}

export async function generateDailyWhatsAppQuestions(
  jobRole: string,
  experienceLevel: string
): Promise<string> {

  const prompt = `
Generate 10 interview practice questions for a ${experienceLevel} ${jobRole} in India.
Mix HR, technical and situational questions.

Format as WhatsApp message:

🎯 *Daily Interview Practice*
Role: ${jobRole}

*Q1.* question here

*Q2.* question here

(up to Q10)

💡 _Reply with your answer for AI feedback!_
_AI Placement Coach_ 🚀
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].type === 'text'
    ? response.content[0].text : ''
}