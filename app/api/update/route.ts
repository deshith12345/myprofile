import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'
import { Octokit } from 'octokit'

export async function POST(request: Request) {
    const octokit = process.env.GITHUB_TOKEN ? new Octokit({ auth: process.env.GITHUB_TOKEN }) : null
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { type, data } = await request.json()

        const validTypes = ['profile', 'skills', 'projects', 'achievements']
        if (!validTypes.includes(type)) {
            return NextResponse.json({ success: false, message: 'Invalid data type' }, { status: 400 })
        }

        // 1. Update MongoDB (Source of truth for instant updates)
        const db = await getDb()
        await db.collection('config').updateOne(
            { type },
            { $set: { data, lastUpdated: new Date() } },
            { upsert: true }
        )

        // 2. Silent Sync to GitHub (Backup without triggering redeploy)
        let githubSyncSuccess = false
        if (octokit && process.env.GITHUB_REPO) {
            try {
                const repoPath = process.env.GITHUB_REPO.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
                const [owner, repo] = repoPath.split('/')
                const filePath = `data/${type === 'achievements' ? 'achievements' : type}.ts`

                // Format the data as a TypeScript export
                const fileContent = `export const ${type} = ${JSON.stringify(data, null, 2)}`
                const base64Content = Buffer.from(fileContent).toString('base64')

                // Get existing SHA
                let sha: string | undefined
                try {
                    const { data: existingFile } = await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: filePath,
                        ref: 'main'
                    })
                    if (!Array.isArray(existingFile)) {
                        sha = existingFile.sha
                    }
                } catch (e) { }

                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: filePath,
                    message: `[skip ci] Admin: Update ${type} data`,
                    content: base64Content,
                    sha,
                    branch: 'main'
                })
                githubSyncSuccess = true
            } catch (err) {
                console.error('GitHub Sync Failed:', err)
            }
        }

        // Revalidate the home page to show updated content
        revalidatePath('/')

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${type}. ${githubSyncSuccess ? 'GitHub synced silently.' : ''}`,
            revalidated: true,
            githubSynced: githubSyncSuccess
        })
    } catch (error) {
        console.error('Update Request Error:', error)
        return NextResponse.json({ success: false, message: 'Invalid synchronization request' }, { status: 500 })
    }
}
