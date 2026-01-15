'use client'

import { Github, Linkedin, Mail, Twitter, ArrowUp } from 'lucide-react'
import { Profile } from '@/data/types'
import { scrollToElement } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

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
      return null
  }
}

export function Footer({ profile }: { profile: Profile }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{profile.name}</h3>
            <p className="text-gray-400 mb-4">{profile.tagline}</p>
            <div className="flex gap-4">
              {profile.socialLinks.map((link) => {
                const Icon = getIcon(link.platform)
                if (!Icon) return null
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    aria-label={link.platform}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToElement('home')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToElement('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToElement('projects')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToElement('achievements')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Achievements
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToElement('contact')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-white transition-colors"
                >
                  {profile.email}
                </a>
              </li>
              <li>{profile.location}</li>
              <li>{profile.timezone}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} {profile.name}. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToElement('home')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  )
}

