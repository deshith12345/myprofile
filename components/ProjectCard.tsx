'use client'

import { useState, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Star } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Project } from '@/data/types'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  priority?: boolean
}

export function ProjectCard({ project, onClick, priority = false }: ProjectCardProps) {
  const [imgSrc, setImgSrc] = useState(project.image)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/images/projects/nebula.jpg')
    } else {
      // Set empty src to show fallback background
      setImgSrc('')
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const handleLiveDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (project.liveUrl) {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (project.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card hover className="h-full flex flex-col">
        {/* Project Image Container */}
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          className="relative w-full h-48 md:h-56 rounded-t-xl overflow-hidden mb-4 cursor-pointer bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`View details for ${project.title} project`}
        >
          {imgSrc ? (
            <>
              <Image
                src={imgSrc}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`
                  object-cover transition-all duration-300
                  ${isLoading ? 'opacity-0 scale-105' : 'opacity-100'}
                  hover:scale-110
                `}
                onError={handleImageError}
                onLoad={handleImageLoad}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {project.title}
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="warning">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

          {/* View Details Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
            Click to view details
          </div>
        </div>

        {/* Project Info */}
        <div className="flex-1 flex flex-col px-4 pb-4">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            {project.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
            {project.longDescription || project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge
                key={tech}
                variant="primary"
                className="transition-transform hover:scale-105"
              >
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge
                variant="default"
                title={`Also uses: ${project.technologies.slice(4).join(', ')}`}
              >
                +{project.technologies.length - 4}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            {project.liveUrl && (
              <Button
                size="sm"
                variant="primary"
                icon={ExternalLink}
                onClick={handleLiveDemoClick}
                className="flex-1 min-w-0"
                aria-label={`Open live demo of ${project.title}`}
                title="Open live demo"
              >
                <span className="truncate">Live Demo</span>
              </Button>
            )}

            {project.githubUrl && (
              <Button
                size="sm"
                variant="outline"
                icon={Github}
                onClick={handleGithubClick}
                className="flex-1 min-w-0"
                aria-label={`View source code of ${project.title} on GitHub`}
                title="View source code"
              >
                <span className="truncate">Code</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={onClick}
              className="flex-1 min-w-0 bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm transition-all duration-200"
              aria-label={`View detailed information about ${project.title}`}
              title="View project details"
            >
              <span className="truncate font-semibold">Details</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}