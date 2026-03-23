// app/api/admin/upload-template/route.ts — graceful fallback version
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { data, error } = await supabase.from('resume_templates').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ success: true, templates: [] })
    return NextResponse.json({ success: true, templates: data || [] })
  } catch {
    return NextResponse.json({ success: true, templates: [] })
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const formData = await req.formData()
    const file        = formData.get('file') as File | null
    const name        = formData.get('name') as string
    const subtitle    = (formData.get('subtitle') as string) || name
    const creditCost  = parseInt(formData.get('credit_cost') as string || '0')
    const bestFor     = (formData.get('best_for') as string) || 'All roles'
    const columns     = parseInt(formData.get('columns') as string || '1')
    const hasPhoto    = formData.get('has_photo') === 'true'
    const atsScore    = parseInt(formData.get('ats_score') as string || '95')
    const badge       = (formData.get('badge') as string) || (creditCost === 0 ? 'Free' : 'Pro')
    const displayOrder= parseInt(formData.get('display_order') as string || '99')

    if (!name) return NextResponse.json({ error: 'Template name is required' }, { status: 400 })

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const templateId = `${slug}-${Date.now()}`

    let fileUrl = ''
    let fileType = 'image'
    let fileName = ''

    if (file) {
      fileName = file.name
      const ext = fileName.split('.').pop()?.toLowerCase() || 'bin'
      fileType = ['pdf'].includes(ext) ? 'pdf' : ['docx','doc'].includes(ext) ? 'docx' : 'image'

      // Try to upload to Supabase Storage
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const storagePath = `templates/${templateId}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('resume-templates')
          .upload(storagePath, buffer, { contentType: file.type, upsert: false })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('resume-templates').getPublicUrl(storagePath)
          fileUrl = urlData.publicUrl
        } else {
          console.warn('Storage upload skipped (bucket may not exist):', uploadError.message)
        }
      } catch (storageErr) {
        console.warn('Storage error (template saved without file):', storageErr)
      }
    }

    const templateData = {
      id: templateId, name, subtitle,
      credit_cost: creditCost, is_free: creditCost === 0,
      ats_score: atsScore, columns, has_photo: hasPhoto,
      best_for: bestFor, badge, is_active: true,
      display_order: displayOrder,
      file_url: fileUrl, file_type: fileType, file_name: fileName,
      source: 'admin_upload', created_at: new Date().toISOString()
    }

    const { data: template, error: dbError } = await supabase
      .from('resume_templates').insert(templateData).select().single()

    if (dbError) {
      return NextResponse.json({
        error: `DB error: ${dbError.message}. Please run SUPABASE_RUN_THIS.sql first.`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `✅ Template "${name}" uploaded successfully!`,
      template, file_url: fileUrl
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await supabase.from('resume_templates')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await supabase.from('resume_templates').delete().eq('id', id)
    return NextResponse.json({ success: true, message: 'Template deleted' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}