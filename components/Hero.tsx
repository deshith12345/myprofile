'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ExternalLink, Github, Linkedin, Mail, Twitter } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { scrollToElement } from '@/lib/utils'
import { profile as ProfileType } from '@/data/profile'

export function Hero({ profile }: { profile: typeof ProfileType }) {
  const roles = profile.roles || ['Cybersecurity Student', 'Security Analyst', 'Penetration Tester', 'Threat Hunter']
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!roles || roles.length === 0) return
    const currentRole = roles[currentRoleIndex]
    if (!currentRole) return
    let timeout: NodeJS.Timeout

    if (!isDeleting && displayText.length < currentRole.length) {
      const typingSpeed = isClient && window.innerWidth < 768 ? 150 : 100
      timeout = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length + 1))
      }, typingSpeed)
    } else if (!isDeleting && displayText.length === currentRole.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2500)
    } else if (isDeleting && displayText.length > 0) {
      const deletingSpeed = isClient && window.innerWidth < 768 ? 80 : 40
      timeout = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length - 1))
      }, deletingSpeed)
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false)
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRoleIndex, roles, isClient])

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return Github
      case 'linkedin':
        return Linkedin
      case 'twitter':
        return Twitter
      case 'email':
        return Mail
      default:
        return ExternalLink
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 md:pt-20"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -z-10" />

      {/* Particle Effect Background - Disabled on mobile to save performance */}
      {isClient && typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400 dark:bg-primary-600 rounded-full opacity-30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [
                  null,
                  Math.random() * window.innerHeight,
                ],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 5 + 5, // Slower transitions
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-4 py-1 rounded-full text-sm font-medium">
                Welcome to my portfolio
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              Hi, I&apos;m{' '}
              <span className="gradient-text">{profile.name}</span>
            </motion.h1>

            <motion.div
              variants={itemVariants}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 h-10 sm:h-12"
            >
              <span className="text-gray-700 dark:text-gray-300">I&apos;m a </span>
              <span className="text-primary-600 dark:text-primary-400">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl"
            >
              {profile.tagline}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl"
            >
              {profile.bio}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              <Button
                size="lg"
                onClick={() => scrollToElement('projects')}
                icon={ExternalLink}
              >
                View Projects
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = profile.resume
                  link.download = 'Deshith_Deemantha_Resume.pdf'
                  link.target = '_blank'
                  link.rel = 'noopener noreferrer'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                icon={Download}
              >
                Download CV
              </Button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              variants={itemVariants}
              className="flex gap-4 justify-center lg:justify-start"
            >
              {profile.socialLinks.map((link) => {
                const Icon = getIcon(link.platform)
                return (
                  <motion.a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-600 dark:hover:border-primary-400 transition-all duration-200"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-3xl opacity-50" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-primary-400 to-secondary-400">
                <Image
                  src={profile.image || "/profile.jpg"}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 224px, (max-width: 1024px) 320px, 384px"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => scrollToElement('about')}
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            aria-label="Scroll down"
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2, // Slower animation
                ease: "easeInOut"
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
