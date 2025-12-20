import { NextResponse } from 'next/server'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        // Retrieve credentials from environment variables
        const adminUser = process.env.ADMIN_USERNAME || 'admin'
        const adminPass = process.env.ADMIN_PASSWORD || 'password123'

        if (username === adminUser && password === adminPass) {
            // Create a session
            const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
            const session = await encrypt({ username, expiresAt })

            // Set session cookie
            cookies().set('admin_session', session, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                expires: expiresAt,
                sameSite: 'lax',
                path: '/',
            })

            return NextResponse.json({ success: true, message: 'Access Granted' })
        }

        return NextResponse.json(
            { success: false, message: 'Access Denied: Invalid credentials' },
            { status: 401 }
        )
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    cookies().delete('admin_session')
    return NextResponse.json({ success: true, message: 'Logged out' })
}
