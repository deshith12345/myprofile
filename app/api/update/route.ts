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

        const { type, data } = await request.json()
        const dataDir = path.join(process.cwd(), 'data')

        let filePath = ''
        let content = ''

        switch (type) {
            case 'profile':
                filePath = path.join(dataDir, 'profile.ts')
                content = `export const profile = ${JSON.stringify(data, null, 2)}`
                break
            case 'skills':
                filePath = path.join(dataDir, 'skills.ts')
                content = `export interface Skill {\n  name: string\n  category: 'security-tools' | 'programming' | 'security-concepts' | 'cloud-security' | 'compliance'\n  proficiency: number\n  icon?: string\n  isBrandIcon?: boolean\n  brandColor?: string\n}\n\nexport const skills: Skill[] = ${JSON.stringify(data, null, 2)}`
                break
            case 'projects':
                filePath = path.join(dataDir, 'projects.ts')
                content = `export interface Project {\n  id: string\n  title: string\n  description: string\n  longDescription: string\n  image: string\n  images?: string[]\n  technologies: string[]\n  category: 'web' | 'mobile' | 'opensource' | 'other'\n  featured: boolean\n  liveUrl?: string\n  githubUrl?: string\n  date: string\n  highlights: string[]\n}\n\nexport const projects: Project[] = ${JSON.stringify(data, null, 2)}`
                break
            case 'achievements':
                filePath = path.join(dataDir, 'achievements.ts')
                content = `export type AchievementCategory = 'award' | 'certification' | 'publication' | 'speaking'\n\nexport interface Achievement {\n  id: string\n  title: string\n  organization: string\n  date: string\n  description: string\n  icon: string\n  verificationUrl?: string\n  category: AchievementCategory\n  certificateFile?: string\n}\n\nexport const achievements: Achievement[] = ${JSON.stringify(data, null, 2)}`
                break
            default:
                return NextResponse.json({ success: false, message: 'Invalid data type' }, { status: 400 })
        }

        // 1. Attempt local file update (works in local dev)
        let localWriteSuccess = false
        try {
            await fs.writeFile(filePath, content, 'utf-8')
            localWriteSuccess = true
        } catch (writeError: any) {
            console.warn('Local FS Write Failed (expected on Vercel):', writeError.message)
        }

        // 2. Attempt GitHub repository update (works in production if GITHUB_TOKEN is set)
        let githubUpdateSuccess = false
        if (octokit && process.env.GITHUB_REPO) {
            try {
                const repoPath = process.env.GITHUB_REPO.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
                const [owner, repo] = repoPath.split('/')

                if (!owner || !repo) {
                    throw new Error(`Invalid GITHUB_REPO format: "${process.env.GITHUB_REPO}". Expected "owner/repo"`)
                }

                const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/')

                // Get the current file SHA
                let currentFileSha: string | undefined
                try {
                    const { data: currentFile } = await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: relativePath,
                        ref: 'main'
                    })
                    if (!Array.isArray(currentFile)) {
                        currentFileSha = currentFile.sha
                    }
                } catch (getShaError: any) {
                    console.warn(`File ${relativePath} fetch failed (SHA): ${getShaError.status}. Creating/Updating anyway.`);
                }

                // Update or create the file on GitHub
                const response = await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: relativePath,
                    branch: 'main', // Explicitly target main
                    message: `Admin Hub: Update ${type} data`,
                    content: Buffer.from(content).toString('base64'),
                    sha: currentFileSha,
                    committer: {
                        name: 'Deshith Deemantha',
                        email: 'deemanthadeshith@gmail.com',
                    },
                    author: {
                        name: 'Deshith Deemantha',
                        email: 'deemanthadeshith@gmail.com',
                    },
                })
                console.log(`GitHub Sync Success: ${relativePath} [SHA: ${response.data.content?.sha}]`);
                githubUpdateSuccess = true
            } catch (githubError: any) {
                console.error('GitHub API Update Error:', githubError)
                // If local write ALSO failed, then we have a problem
                if (!localWriteSuccess) {
                    return NextResponse.json({
                        success: false,
                        message: `GitHub Sync Failed (${githubError.status}): Ensure the token has 'repo' scope, the repo name is correct ("owner/repo"), and the branch is "main".`
                    }, { status: 500 })
                }
            }
        }

        if (!localWriteSuccess && !githubUpdateSuccess) {
            return NextResponse.json({
                success: false,
                message: process.env.GITHUB_TOKEN ? 'Synchronization failed. Could not write to local FS or GitHub.' : 'Read-only environment. Please configure GITHUB_TOKEN to enable live updates.'
            }, { status: 500 })
        }

        // Extract owner/repo once more for the URL return
        const repoPath = process.env.GITHUB_REPO?.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '') || ''
        const [owner, repo] = repoPath.split('/')

        return NextResponse.json({
            success: true,
            message: githubUpdateSuccess ? 'Data synchronized to GitHub. Site will redeploy automatically.' : 'Data saved locally.',
            commitUrl: githubUpdateSuccess ? `https://github.com/${owner}/${repo}/commits/main` : null
        })
    } catch (error) {
        console.error('Update Request Error:', error)
        return NextResponse.json({ success: false, message: 'Invalid synchronization request' }, { status: 500 })
    }
}
