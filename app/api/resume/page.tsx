import { NextRequest, NextResponse } from 'next/server'
import { generateResume } from '@/lib/claude'
import { checkAndDeductCredits } from '@/lib/credits'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId, name, email, phone,
      skills, experience, education,
      projects, targetRole, targetCompany
    } = body

    if (!userId || !name || !skills || !targetRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check and deduct 5 credits
    const hasCredits = await checkAndDeductCredits(userId, 5)
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Not enough credits. Please upgrade your plan.' },
        { status: 402 }
      )
    }

    // Generate resume using Claude
    const resumeContent = await generateResume(
      name, email, phone, skills,
      experience, education, projects,
      targetRole, targetCompany
    )

    // Save to Supabase
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        job_role: targetRole,
        target_company: targetCompany,
        resume_content: resumeContent,
        ats_score: 0
      })
      .select()
      .single()

    if (error) console.error('Supabase error:', error)

    return NextResponse.json({
      success: true,
      resume: resumeContent,
      resumeId: data?.id
    })

  } catch (error) {
    console.error('Resume error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ resumes: data })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}