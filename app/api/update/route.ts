import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { type, data } = await request.json()

        const validTypes = ['profile', 'skills', 'projects', 'achievements', 'badges']
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

        // Revalidate the home page to show updated content
        revalidatePath('/')

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${type}.`,
            revalidated: true
        })
    } catch (error) {
        console.error('Update Request Error:', error)
        return NextResponse.json({ success: false, message: 'Invalid synchronization request' }, { status: 500 })
    }
}
