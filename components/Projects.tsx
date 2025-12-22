'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import { Badge } from '@/components/ui/Badge'

type Filter = 'all' | 'web' | 'mobile' | 'opensource' | 'other'
type Sort = 'latest' | 'popular' | 'featured'
import { Project } from '@/data/types'

export function Projects({ projects: projectsData }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('latest')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsData

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((project) => project.category === filter)
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'latest':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'featured':
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'popular':
          // You can add view counts or other metrics here
          return 0
        default:
          return 0
      }
    })

    return sorted
  }, [filter, sort, projectsData])

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Web Apps', value: 'web' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Open Source', value: 'opensource' },
    { label: 'Other', value: 'other' },
  ]

  const sorts: { label: string; value: Sort }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Featured', value: 'featured' },
    { label: 'Popular', value: 'popular' },
  ]

  return (
    <section id="projects" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A collection of projects I&apos;ve worked on, showcasing my skills and experience
          </p>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-12"
        >
          {/* Filters - horizontally scrollable on mobile */}
          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="flex gap-2 sm:flex-wrap sm:justify-center min-w-max sm:min-w-0">
              {filters.map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${filter === filterOption.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sorts.map((sortOption) => (
                <option key={sortOption.value} value={sortOption.value}>
                  {sortOption.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProjectCard
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            </motion.div>
          ))}
        </div>

        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No projects found for the selected filter.
            </p>
          </div>
        )}

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  )
}

