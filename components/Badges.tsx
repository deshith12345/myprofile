'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/data/types'

export function Badges({ badges }: { badges: Badge[] }) {
    if (!badges) return null

    // Filter valid badges
    const validBadges = badges.filter(b => b.image && b.image.trim() !== '')

    if (validBadges.length === 0) return null

    return (
        <section className="py-10 bg-gray-50 dark:bg-[#030711] overflow-hidden border-t border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Digital Credentials
                </h3>
            </div>

            <div className="relative flex w-full overflow-hidden mask-linear-fade">
                {/* Gradient masks */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-gray-50 dark:from-[#030711] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-gray-50 dark:from-[#030711] to-transparent pointer-events-none" />

                <div className="flex min-w-full">
                    <MarqueeContent badges={validBadges} />
                    <MarqueeContent badges={validBadges} />
                </div>
            </div>
        </section>
    )
}

function MarqueeContent({ badges }: { badges: Badge[] }) {
    return (
        <motion.div
            className="flex shrink-0 gap-12 pr-12 items-center"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{
                duration: Math.max(20, badges.length * 5), // Dynamic speed based on count
                ease: "linear",
                repeat: Infinity,
            }}
        >
            {badges.map((badge, idx) => (
                <div
                    key={`${badge.id}-${idx}`}
                    className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:scale-105"
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
    )
}
