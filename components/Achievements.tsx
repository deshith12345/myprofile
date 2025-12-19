'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, BookOpen, Cloud, Github, Mic, Trophy, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { achievements } from '@/data/achievements'
import { formatDate } from '@/lib/utils'
import { CertificateModal } from './CertificateModal'
import type { Achievement } from '@/data/achievements'

const categoryIcons = {
  award: Trophy,
  certification: Award,
  publication: BookOpen,
  speaking: Mic,
}

const categoryLabels = {
  award: 'Award',
  certification: 'Certification',
  publication: 'Publication',
  speaking: 'Speaking',
}

export function Achievements() {
  const [selectedCertificate, setSelectedCertificate] = useState<Achievement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCertificateClick = (achievement: Achievement) => {
    if (achievement.certificateFile) {
      setSelectedCertificate(achievement)
      setIsModalOpen(true)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section
      id="achievements"
      className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Achievements & <span className="gradient-text">Recognition</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Certifications, awards, publications, and speaking engagements
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {achievements.map((achievement) => {
            const Icon = categoryIcons[achievement.category]
            const isPDF = achievement.certificateFile?.toLowerCase().endsWith('.pdf')
            const isImage = achievement.certificateFile && !isPDF

            return (
              <motion.div key={achievement.id} variants={itemVariants}>
                <Card hover className="h-full flex flex-col">
                  {/* Certificate Image */}
                  {achievement.certificateFile && (
                    <div
                      className={`relative w-full h-48 rounded-t-xl overflow-hidden mb-4 ${
                        achievement.certificateFile ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => handleCertificateClick(achievement)}
                    >
                      {isImage ? (
                        <Image
                          src={achievement.certificateFile}
                          alt={achievement.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
                          <div className="text-center p-4">
                            <Icon className="h-12 w-12 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              PDF Certificate
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Click to view
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <Badge variant="primary">
                        {categoryLabels[achievement.category]}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                      {achievement.organization}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {formatDate(achievement.date)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 flex-1 text-sm">
                      {achievement.description}
                    </p>

                    <div className="flex items-center gap-3 mt-auto">
                      {achievement.certificateFile && (
                        <button
                          onClick={() => handleCertificateClick(achievement)}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View Certificate
                        </button>
                      )}
                      {achievement.verificationUrl && (
                        <a
                          href={achievement.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline ml-auto"
                        >
                          Verify
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Certificate Modal */}
        <CertificateModal
          achievement={selectedCertificate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  )
}
