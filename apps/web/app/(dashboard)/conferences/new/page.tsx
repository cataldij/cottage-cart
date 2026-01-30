import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AIConferenceForm } from '@/components/conference/ai-conference-form'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function createConferenceAction(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = String(formData.get('name') || '').trim()
  const slugInput = String(formData.get('slug') || '').trim()
  const startDate = String(formData.get('start_date') || '').trim()
  const endDate = String(formData.get('end_date') || '').trim()

  if (!name || !startDate || !endDate) {
    return
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name)

  const payload = {
    name,
    slug,
    tagline: String(formData.get('tagline') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    start_date: startDate,
    end_date: endDate,
    timezone: String(formData.get('timezone') || 'UTC'),
    venue_name: String(formData.get('venue_name') || '').trim() || null,
    venue_address: String(formData.get('venue_address') || '').trim() || null,
    primary_color: String(formData.get('primary_color') || '#2563eb'),
    secondary_color: String(formData.get('secondary_color') || '').trim() || null,
    website_url: String(formData.get('website_url') || '').trim() || null,
    is_public: formData.get('is_public') === 'on',
    is_hybrid: formData.get('is_hybrid') === 'on',
    registration_open: formData.get('registration_open') === 'on',
    max_attendees: formData.get('max_attendees')
      ? Number(formData.get('max_attendees'))
      : null,
    created_by: user.id,
  }

  console.log('Creating conference with payload:', JSON.stringify(payload, null, 2))

  const { data, error } = await supabase
    .from('conferences')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    console.error('Conference insert error:', error)
    throw new Error(`Failed to create conference: ${error.message} (code: ${error.code})`)
  }

  console.log('Conference created with ID:', data.id)

  // Add the creator as an organizer in conference_members
  const { error: memberError } = await supabase
    .from('conference_members')
    .insert({
      conference_id: data.id,
      user_id: user.id,
      role: 'organizer',
    })

  if (memberError) {
    console.error('Member insert error:', memberError)
    // If adding member fails, try to clean up the conference
    await supabase.from('conferences').delete().eq('id', data.id)
    throw new Error(`Failed to add organizer: ${memberError.message} (code: ${memberError.code})`)
  }

  console.log('User added as organizer, redirecting to conference page')
  redirect(`/conferences/${data.id}`)
}

export default function NewConferencePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Conference</h1>
          <p className="text-muted-foreground">
            Create a new conference with AI-powered assistance
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/conferences">Back to Conferences</Link>
        </Button>
      </div>

      <AIConferenceForm action={createConferenceAction}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/conferences">Cancel</Link>
          </Button>
          <Button type="submit">Create Conference</Button>
        </div>
      </AIConferenceForm>
    </div>
  )
}
