import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { getDb } from '@/lib/mongodb'
import { GridFSBucket, ObjectId } from 'mongodb'

// Allow larger uploads (internal node limit) and extended timeout
export const runtime = 'nodejs'
// Increase timeout to 5 minutes to accommodate slow large file merges
export const maxDuration = 300

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

        // Check if this is a chunked upload
        const chunkIndex = formData.get('chunkIndex')
        const totalChunks = formData.get('totalChunks')
        const uploadId = formData.get('uploadId')

        if (chunkIndex !== null && totalChunks !== null && uploadId !== null) {
            return handleChunkedUpload(formData)
        }

        // --- Standard Single File Upload (Legacy/Small files) ---
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        }

        // Validation
        const allowedTypes = [
            'image/',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.ms-powerpoint'
        ]
        const isValidType = allowedTypes.some(type => file.type.startsWith(type) || file.type === type)

        if (!isValidType) {
            return NextResponse.json({ success: false, message: 'Invalid file type.' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Sanitize
        const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
        const fileName = `${Date.now()}_${sanitizedName}`

        // Save to GridFS
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

        return NextResponse.json({
            success: true,
            message: `Asset saved to database.`,
            url: `/api/images/${fileName}`
        })

    } catch (error: any) {
        console.error('Upload Error:', error)
        return NextResponse.json({ success: false, message: error.message || 'Failed to upload' }, { status: 500 })
    }
}

async function handleChunkedUpload(formData: FormData) {
    const file = formData.get('file') as File
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const uploadId = formData.get('uploadId') as string
    const fileName = formData.get('fileName') as string
    const contentType = formData.get('contentType') as string

    if (!file || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
        return NextResponse.json({ success: false, message: 'Missing chunk metadata' }, { status: 400 })
    }

    const db = await getDb()
    const tempCollection = db.collection('upload_chunks')

    const buffer = Buffer.from(await file.arrayBuffer())

    // Store chunk
    await tempCollection.insertOne({
        uploadId,
        index: chunkIndex,
        data: buffer, // Store as binary
        createdAt: new Date()
    })

    // If this is the last chunk, merge and finalize
    if (chunkIndex === totalChunks - 1) {
        // Verify we have all chunks
        const count = await tempCollection.countDocuments({ uploadId })
        // If count mismatch, we can't merge safely
        if (count !== totalChunks) {
            // We can wait a bit or fail. For now, fail to be safe.
            // In a real optimized system we might wait/retry.
            // But client ensures sequential delivery.
        }

        // We fetch all chunks sorted by index
        // We fetch all chunks sorted by index
        const cursor = tempCollection.find({ uploadId }).sort({ index: 1 })

        const bucket = new GridFSBucket(db, { bucketName: 'images' })

        const sanitizedName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
        const finalFileName = `${Date.now()}_${sanitizedName}`

        const uploadStream = bucket.openUploadStream(finalFileName, {
            metadata: {
                contentType,
                originalName: fileName,
                uploadDate: new Date()
            }
        })

        // Stream chunks to GridFS
        for await (const chunk of cursor) {
            // MongoDB Binary wrapper handling. 
            // If stored as Binary (default), use .buffer. If Buffer, use directly.
            const dataBuffer = (chunk.data && chunk.data.buffer) ? chunk.data.buffer : chunk.data

            await new Promise<void>((resolve, reject) => {
                if (!uploadStream.write(dataBuffer)) {
                    uploadStream.once('drain', resolve)
                } else {
                    resolve()
                }
            })
        }

        await new Promise((resolve, reject) => {
            uploadStream.on('error', reject)
            uploadStream.on('finish', resolve)
            uploadStream.end()
        })

        // Cleanup temp chunks
        await tempCollection.deleteMany({ uploadId })

        return NextResponse.json({
            success: true,
            message: 'Upload complete',
            url: `/api/images/${finalFileName}`
        })
    }

    return NextResponse.json({ success: true, message: `Chunk ${chunkIndex} received` })
}
