import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            config: {
                hasGithubToken: !!process.env.GITHUB_TOKEN,
                hasGithubRepo: !!process.env.GITHUB_REPO,
                repoName: process.env.GITHUB_REPO?.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '') || null
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch config' }, { status: 500 })
    }
}
