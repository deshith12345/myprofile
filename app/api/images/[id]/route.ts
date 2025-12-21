import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const db = await getDb()

        // 1. Try to find image in MongoDB
        const query: any = { $or: [{ name: id }] }
        if (ObjectId.isValid(id)) {
            query.$or.push({ _id: new ObjectId(id) })
        }

        const image = await db.collection('images').findOne(query)
        if (image && image.data) {
            const buffer = Buffer.from(image.data.buffer)
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': image.contentType || 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            })
        }

        // 2. Fallback: Try to find image in local filesystem
        try {
            const filePath = path.join(process.cwd(), 'public', 'images', 'projects', id)
            const fileBuffer = await fs.readFile(filePath)
            // Determine content type from extension
            const ext = path.extname(id).toLowerCase()
            const contentType = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
            }[ext] || 'image/jpeg'

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            })
        } catch (fsError) {
            // Not in FS either
        }

        return new NextResponse('Image not found', { status: 404 })
    } catch (error) {
        console.error('Image Fetch Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
