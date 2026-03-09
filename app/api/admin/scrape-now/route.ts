import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const GITHUB_REPO  = 'whatwedonowmama/website'
const WORKFLOW_FILE = 'weekly-scraper.yml'

async function getAdminOrFail() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  const service = createServiceClient()
  const { data: profile } = await service
    .from('users').select('role').eq('id', authUser.id).single()
  if (!profile || profile.role !== 'admin') return null
  return true
}

// POST /api/admin/scrape-now
// Body: { site?: string }   — omit `site` to scrape all sources with --force
export async function POST(req: NextRequest) {
  if (!await getAdminOrFail()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pat = process.env.GITHUB_PAT
  if (!pat) {
    return NextResponse.json(
      { error: 'GITHUB_PAT is not configured. Add it to your Vercel environment variables.' },
      { status: 503 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const site: string = body.site ?? ''

  // Build workflow inputs
  const inputs: Record<string, string> = {
    force:   site ? 'false' : 'true',  // --force when scraping all, not needed for --site
    site:    site,
    dry_run: 'false',
  }

  const githubRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${pat}`,
        Accept:         'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main', inputs }),
    }
  )

  // GitHub returns 204 No Content on success
  if (githubRes.status === 204) {
    return NextResponse.json({
      ok:      true,
      message: site
        ? `Scraping "${site}" — new events will appear in ~2 minutes.`
        : 'Scraping all sources — new events will appear in ~2 minutes.',
      runsUrl: `https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`,
    })
  }

  // Surface GitHub's error
  let errText = ''
  try { errText = await githubRes.text() } catch {}

  if (githubRes.status === 401) {
    return NextResponse.json(
      { error: 'GitHub token is invalid or expired. Check your GITHUB_PAT in Vercel.' },
      { status: 502 }
    )
  }
  if (githubRes.status === 403) {
    return NextResponse.json(
      { error: 'GitHub token does not have permission to trigger workflows. Make sure it has repo scope.' },
      { status: 502 }
    )
  }
  if (githubRes.status === 404) {
    return NextResponse.json(
      { error: `Workflow file "${WORKFLOW_FILE}" not found on the main branch.` },
      { status: 502 }
    )
  }

  return NextResponse.json(
    { error: `GitHub API error (${githubRes.status}): ${errText}` },
    { status: 502 }
  )
}
