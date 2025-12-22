'use client'

import { Badge } from '@/data/types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Badges({ badges }: { badges: Badge[] }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!badges) return null

    // Filter out invalid data
    const validBadges = badges.filter(b => b.image && b.image.trim() !== '')

    if (validBadges.length === 0) return null

    return (
        <section className="py-12 bg-gray-50 dark:bg-[#030711] border-t border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Digital Credentials
                </h3>
            </div>

            <div className="relative w-full overflow-hidden mask-linear-fade">
                {/* 
                   We use key={validBadges.length} to force a re-mount if items change,
                   ensuring the animation recalculates correctly.
                */}
                <motion.div
                    key={validBadges.length}
                    className="flex gap-12 pr-12 w-max" // w-max ensures it takes up natural width
                    initial={{ x: "100vw" }} // Start off-screen right
                    animate={{ x: "-100%" }} // Move until it is fully off-screen left
                    transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 15, // Adjust speed
                        ease: "linear",
                    }}
                >
                    {validBadges.map((badge, idx) => (
                        <div
                            key={`${badge.id}-${idx}`}
                            className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={badge.image}
                                alt={badge.name}
                                className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
