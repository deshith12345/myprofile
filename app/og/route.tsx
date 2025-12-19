import { ImageResponse } from 'next/og'
import { profile } from '@/data/profile'

// Route segment config
export const runtime = 'edge'

// Image generation
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #3B82F6, #1E40AF)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 20 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 48, opacity: 0.9 }}>
          {profile.title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

