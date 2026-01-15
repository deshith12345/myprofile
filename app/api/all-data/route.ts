import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'

// Fallback data
import { profile as defaultProfile } from '@/data/profile'
import { projects as defaultProjects } from '@/data/projects'
import { skills as defaultSkills } from '@/data/skills'
import { achievements as defaultAchievements } from '@/data/achievements'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        const config = await db.collection('config').find({}).toArray()

        const dataMap = config.reduce((acc: any, item: any) => {
            acc[item.type] = item.data
            return acc
        }, {})

        return NextResponse.json({
            success: true,
            data: {
                profile: dataMap.profile || defaultProfile,
                projects: dataMap.projects || defaultProjects,
                skills: dataMap.skills || defaultSkills,
                achievements: dataMap.achievements || defaultAchievements,
                badges: dataMap.badges || [], // No default badges needed if empty
            }
        })
    } catch (error) {
        console.error('Failed to fetch data for admin:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch current data from database',
            error: String(error)
        }, { status: 500 })
    }
}
