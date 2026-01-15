'use client'

import { Badge } from '@/data/types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Badges({ badges }: { badges: Badge[] }) {
    if (!badges) return null

    // Filter out invalid data
    const validBadges = badges.filter(b => b.image && b.image.trim() !== '')

    if (validBadges.length === 0) return null

    // Duplicate list for seamless loop
    const doubledBadges = [...validBadges, ...validBadges]

    return (
        <section className="py-12 bg-gray-50 dark:bg-[#030711] border-t border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Digital Credentials
                </h3>
            </div>

            <div className="relative w-full overflow-hidden mask-linear-fade">
                <motion.div
                    className="flex gap-12 w-max"
                    animate={{ x: "-50%" }}
                    initial={{ x: 0 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 30, // Slower duration since we have more items
                        ease: "linear",
                    }}
                >
                    {doubledBadges.map((badge, idx) => (
                        <div
                            key={`${badge.id}-${idx}`}
                            className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={badge.image}
                                alt={badge.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
