'use client'

import { useEffect, useState } from 'react'

export function SeasonalEffects() {
    const [effect, setEffect] = useState<'snow' | 'none'>('none')
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkSeason = () => {
            const month = new Date().getMonth() // 0-11
            // December (11) or January (0) -> Snow
            if (month === 11 || month === 0) {
                setEffect('snow')
            } else {
                setEffect('none')
            }
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkSeason()
        checkMobile()

        // Optional: Re-check on resize if stricter breakpoint management is needed
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (effect === 'none') return null

    /**
     * Performance Enhancement:
     * We use pure CSS animations for particles instead of JS RequestAnimationFrame.
     * This keeps the main thread free for scrolling and interactions.
     * On mobile, we reduce the number of layers/particles.
     */
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {effect === 'snow' && <SnowEffect isMobile={isMobile} />}
        </div>
    )
}

function SnowEffect({ isMobile }: { isMobile: boolean }) {
    // Generate stable CSS for snowflakes to avoid hydration mismatch or heavy JS calculation
    // We use 3 layers for parallax depth
    return (
        <>
            <style jsx global>{`
        @keyframes snowfall {
          0% { transform: translateY(-10vh) translateX(0); }
          100% { transform: translateY(110vh) translateX(20px); }
        }
        
        .snowflake {
          position: absolute;
          top: -10vh;
          border-radius: 50%;
          background: white;
          opacity: 0.8;
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .layer-1 .snowflake { width: 3px; height: 3px; filter: blur(0.5px); }
        .layer-2 .snowflake { width: 2px; height: 2px; filter: blur(1px); }
        .layer-3 .snowflake { width: 1px; height: 1px; filter: blur(1.5px); }
      `}</style>

            {/* Layer 1: Foreground (Fast & Larger) */}
            <div className="layer-1 absolute inset-0">
                {[...Array(isMobile ? 10 : 25)].map((_, i) => (
                    <div
                        key={`l1-${i}`}
                        className="snowflake"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 3 + 5}s`, // 5-8s duration
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.4 + 0.6,
                        }}
                    />
                ))}
            </div>

            {/* Layer 2: Midground (Medium) */}
            <div className="layer-2 absolute inset-0">
                {[...Array(isMobile ? 15 : 40)].map((_, i) => (
                    <div
                        key={`l2-${i}`}
                        className="snowflake"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 5 + 8}s`, // 8-13s duration
                            animationDelay: `${Math.random() * 8}s`,
                            opacity: Math.random() * 0.3 + 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Layer 3: Background (Slow & Small) - Skipped on mobile for performance */}
            {!isMobile && (
                <div className="layer-3 absolute inset-0">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={`l3-${i}`}
                            className="snowflake"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDuration: `${Math.random() * 10 + 15}s`, // 15-25s duration
                                animationDelay: `${Math.random() * 10}s`,
                                opacity: Math.random() * 0.2 + 0.1,
                            }}
                        />
                    ))}
                </div>
            )}
        </>
    )
}
