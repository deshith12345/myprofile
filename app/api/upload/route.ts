import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { getDb } from '@/lib/mongodb'
import { GridFSBucket } from 'mongodb'

// Allow larger uploads and extended timeout
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for large file uploads

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

        // Extended validation for documents
        const allowedTypes = [
            'image/',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'application/msword', // .doc
            'application/vnd.ms-powerpoint' // .ppt
        ]

        const isValidType = allowedTypes.some(type => file.type.startsWith(type) || file.type === type)

        if (!isValidType) {
            return NextResponse.json({
                success: false,
                message: 'Invalid file type. Allowed: images, PDF, DOCX, PPTX'
            }, { status: 400 })
        }

        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: 'File too large. Max 25MB.'
            }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
        const fileName = `${Date.now()}_${sanitizedName}`

        // 1. Save to MongoDB using GridFS (Handles >16MB files)
        const db = await getDb()
        const bucket = new GridFSBucket(db, { bucketName: 'images' })

        const uploadStream = bucket.openUploadStream(fileName, {
            metadata: {
                contentType: file.type,
                originalName: file.name,
                uploadDate: new Date()
            }
        })

        await new Promise((resolve, reject) => {
            uploadStream.on('error', reject)
            uploadStream.on('finish', resolve)
            uploadStream.end(buffer)
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
