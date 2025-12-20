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
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'projects')
        const filePath = path.join(uploadDir, fileName)

        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true })

        // Write file
        await fs.writeFile(filePath, buffer)

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            url: `/images/projects/${fileName}`
        })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 })
    }
}
