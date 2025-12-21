import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { getDb } from '@/lib/mongodb'

export async function POST(request: Request) {
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
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            return NextResponse.json({ success: false, message: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 })
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

        // 1. Save to MongoDB (Persistent database storage)
        const db = await getDb()
        await db.collection('images').insertOne({
            name: fileName,
            data: buffer,
            contentType: file.type,
            uploadDate: new Date()
        })

        // The URL will point to our delivery API
        const publicUrl = `/api/images/${fileName}`

        // 2. Local storage fallback (for dev/local persist)
        try {
            const isPdf = file.type === 'application/pdf'
            const uploadDir = path.join(process.cwd(), 'public', isPdf ? 'CV' : 'images/projects')
            await fs.mkdir(uploadDir, { recursive: true })
            const filePath = path.join(uploadDir, fileName)
            await fs.writeFile(filePath, buffer)
        } catch (writeError: any) {
            console.warn('Local FS Upload Failed (expected on Vercel):', writeError.message)
        }

        return NextResponse.json({
            success: true,
            message: `Asset saved to database.`,
            url: publicUrl
        })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 })
    }
}
