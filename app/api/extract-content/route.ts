import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
const pdf = require('pdf-parse')
import mammoth from 'mammoth'

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

        let extractedText = ''
        const buffer = Buffer.from(await file.arrayBuffer())

        if (file.type === 'application/pdf') {
            const data = await pdf(buffer)
            extractedText = data.text
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer })
            extractedText = result.value
        } else {
            return NextResponse.json({
                success: false,
                message: 'Unsupported file type. Please upload PDF or DOCX.'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            text: extractedText
        })

    } catch (error) {
        console.error(' extraction error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to extract content from file'
        }, { status: 500 })
    }
}
