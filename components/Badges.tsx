'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/data/types'
import { ExternalLink } from 'lucide-react'

export function Badges({ badges }: { badges: Badge[] }) {
    if (!badges || badges.length === 0) return null

    // Duplicate list to create seamless loop
    const duplicatedBadges = [...badges, ...badges, ...badges, ...badges]

    return (
        <section className="py-12 bg-gray-50 dark:bg-[#030711] overflow-hidden border-t border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Digital Credentials
                </h3>
            </div>

            <div className="relative flex w-full overflow-hidden mask-linear-fade">
                {/* Gradient masks for smooth fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-gray-50 dark:from-[#030711] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-gray-50 dark:from-[#030711] to-transparent pointer-events-none" />

                <motion.div
                    className="flex gap-8 md:gap-12 flex-nowrap py-4"
                    animate={{
                        x: [0, -1000], // Approximate distance, will adjust with duration
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30, // Adjust speed here
                            ease: "linear",
                        },
                    }}
                    style={{ width: "max-content" }}
                >
                    {duplicatedBadges.map((badge, idx) => (
                        <div
                            key={`${badge.id}-${idx}`}
                            className="relative group shrink-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all duration-300"
                        >
                            <div className="relative w-full h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={badge.image}
                                    alt={badge.name}
                                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                />
                            </div>

                            {/* Tooltip / Link Overlay */}
                            {badge.url && (
                                <a
                                    href={badge.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 z-20 focus:outline-none"
                                    aria-label={`View ${badge.name} credential`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/5 backdrop-blur-[2px] rounded-2xl">
                                        <ExternalLink className="w-5 h-5 text-primary-500" />
                                    </div>
                                </a>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
