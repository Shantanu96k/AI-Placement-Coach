import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

// GET — list all uploaded templates
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('resume_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, templates: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — upload a new template file
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string
    const subtitle = formData.get('subtitle') as string || ''
    const creditCost = parseInt(formData.get('credit_cost') as string || '0')
    const bestFor = formData.get('best_for') as string || 'All roles'
    const columns = parseInt(formData.get('columns') as string || '1')
    const hasPhoto = formData.get('has_photo') === 'true'
    const atsScore = parseInt(formData.get('ats_score') as string || '95')
    const badge = formData.get('badge') as string || (creditCost === 0 ? 'Free' : 'Pro')
    const displayOrder = parseInt(formData.get('display_order') as string || '99')

    if (!file || !name) {
      return NextResponse.json({ error: 'File and name are required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, PDF, DOCX` }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique slug for the template
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const ext = file.name.split('.').pop() || 'bin'
    const storagePath = `templates/${slug}-${Date.now()}.${ext}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume-templates')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    let fileUrl = ''
    if (uploadError) {
      // Storage bucket may not exist — still save metadata without file URL
      console.error('Storage upload error:', uploadError.message)
      fileUrl = ''
    } else {
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resume-templates')
        .getPublicUrl(storagePath)
      fileUrl = urlData.publicUrl
    }

    // Determine file type category
    let fileType = 'image'
    if (file.type === 'application/pdf') fileType = 'pdf'
    else if (file.type.includes('word') || file.type.includes('document')) fileType = 'docx'

    // Save metadata to resume_templates table
    const { data: template, error: dbError } = await supabase
      .from('resume_templates')
      .insert({
        id: slug + '-' + Date.now(),
        name,
        subtitle: subtitle || name,
        credit_cost: creditCost,
        is_free: creditCost === 0,
        ats_score: atsScore,
        columns,
        has_photo: hasPhoto,
        best_for: bestFor,
        badge,
        is_active: true,
        display_order: displayOrder,
        file_url: fileUrl,
        file_type: fileType,
        file_name: file.name,
        source: 'admin_upload',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({
        error: `DB error: ${dbError.message}`,
        hint: 'Ensure resume_templates table has columns: file_url, file_type, file_name, source'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Template "${name}" uploaded successfully!`,
      template,
      file_url: fileUrl,
      storage_path: uploadData?.path || 'not stored'
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — update template metadata or toggle active
export async function PATCH(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('resume_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, template: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove a template
export async function DELETE(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Get template to find file_url
    const { data: tmpl } = await supabase.from('resume_templates').select('file_url').eq('id', id).single()

    // Delete from storage if has URL
    if (tmpl?.file_url) {
      const path = tmpl.file_url.split('/resume-templates/')[1]
      if (path) {
        await supabase.storage.from('resume-templates').remove([path])
      }
    }

    const { error } = await supabase.from('resume_templates').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true, message: 'Template deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
