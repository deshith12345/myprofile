import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { Octokit } from 'octokit'

export async function POST(request: Request) {
    const octokit = process.env.GITHUB_TOKEN ? new Octokit({ auth: process.env.GITHUB_TOKEN }) : null
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        }

        // Basic validation
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ success: false, message: 'Invalid file type. Only images are allowed.' }, { status: 400 })
        }

        // Limit size to 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, message: 'File too large. Max 5MB.' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
        const fileName = `${Date.now()}_${sanitizedName}`
        const storagePath = `public/images/projects/${fileName}`
        const publicUrl = `/images/projects/${fileName}`
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'projects')
        const filePath = path.join(uploadDir, fileName)

        // 1. Attempt local file update (works in local dev)
        let localWriteSuccess = false
        try {
            await fs.mkdir(uploadDir, { recursive: true })
            await fs.writeFile(filePath, buffer)
            localWriteSuccess = true
        } catch (writeError: any) {
            console.warn('Local FS Upload Failed (expected on Vercel):', writeError.message)
        }

        // 2. Attempt GitHub persistent upload
        let githubUploadSuccess = false
        if (octokit && process.env.GITHUB_REPO) {
            try {
                const repoPath = process.env.GITHUB_REPO.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
                const [owner, repo] = repoPath.split('/')

                if (!owner || !repo) {
                    throw new Error(`Invalid GITHUB_REPO format: "${process.env.GITHUB_REPO}". Expected "owner/repo"`)
                }

                // Get existing file SHA if it exists (to prevent collisions/conflicts)
                let currentSha: string | undefined
                try {
                    const { data: existingFile } = await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: storagePath,
                        ref: 'main'
                    })
                    if (!Array.isArray(existingFile)) {
                        currentSha = existingFile.sha
                    }
                } catch (e) {
                    // File doesn't exist yet, which is fine
                }

                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: storagePath,
                    branch: 'main',
                    message: `Admin Hub: Upload asset ${fileName}`,
                    content: buffer.toString('base64'),
                    sha: currentSha,
                    committer: {
                        name: 'Deshith Deemantha',
                        email: 'deemanthadeshith@gmail.com',
                    },
                    author: {
                        name: 'Deshith Deemantha',
                        email: 'deemanthadeshith@gmail.com',
                    },
                })
                githubUploadSuccess = true
                console.log(`GitHub Asset Sync Success: ${storagePath}`)
            } catch (githubError: any) {
                console.error('GitHub Asset Sync Error:', githubError)
                // If local write also failed, then we have a real problem
                if (!localWriteSuccess) {
                    return NextResponse.json({
                        success: false,
                        message: `Upload failed: GitHub API error (${githubError.status}). Asset will not persist.`
                    }, { status: 500 })
                }
            }
        }

        if (!localWriteSuccess && !githubUploadSuccess) {
            return NextResponse.json({ success: false, message: 'Storage failure: both local and remote writes failed.' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: githubUploadSuccess ? 'Asset persistent on GitHub. Deployment triggered.' : 'Asset saved locally.',
            url: publicUrl
        })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 })
    }
}
