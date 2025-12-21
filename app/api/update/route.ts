import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
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
                content = `export interface Achievement {\n  id: string\n  title: string\n  organization: string\n  date: string\n  description: string\n  icon: string\n  verificationUrl?: string\n  category: string\n  certificateFile?: string\n}\n\nexport const achievements: Achievement[] = ${JSON.stringify(data, null, 2)}`
                break
            default:
                return NextResponse.json({ success: false, message: 'Invalid data type' }, { status: 400 })
        }

        try {
            await fs.writeFile(filePath, content, 'utf-8')
        } catch (writeError: any) {
            console.error('File System Write Error:', writeError)
            return NextResponse.json({
                success: false,
                message: process.env.VERCEL ? 'Vercel filesystem is read-only. Please update locally and push.' : 'Failed to write to local data file.'
            }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Data updated successfully' })
    } catch (error) {
        console.error('Update Request Error:', error)
        return NextResponse.json({ success: false, message: 'Invalid synchronization request' }, { status: 500 })
    }
}
