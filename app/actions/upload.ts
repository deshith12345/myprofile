'use server'

import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { getDb } from '@/lib/mongodb'
import { GridFSBucket } from 'mongodb'

export async function uploadFileAction(formData: FormData) {
    try {
        const session = await getSession()
        if (!session) {
            throw new Error('Unauthorized')
        }

        const file = formData.get('file') as File | null

        if (!file) {
            throw new Error('No file uploaded')
        }

        // Expanded validation for documents
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
            throw new Error('Invalid file type. Allowed: images, PDF, DOCX, PPTX')
        }

        if (file.size > 100 * 1024 * 1024) {
            throw new Error('File too large. Max 100MB.')
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

        return {
            success: true,
            message: `Asset saved to database.`,
            url: publicUrl
        }
    } catch (error: any) {
        console.error('Upload Error:', error)
        return { success: false, message: error.message || 'Failed to upload image' }
    }
}
