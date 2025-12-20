'use client'

import { motion } from 'framer-motion'
import { Code, Database, Palette, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { profile } from '@/data/profile'
import { skills as skillsData } from '@/data/skills'

const categoryIcons = {
  frontend: Code,
  backend: Database,
  tools: Code,
  soft: Users,
}

const categoryLabels = {
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools & Technologies',
  soft: 'Soft Skills',
}

export function About() {
  const categories: Array<'frontend' | 'backend' | 'tools' | 'soft'> = [
    'frontend',
    'backend',
    'tools',
    'soft',
  ]

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
      id="about"
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
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn more about my journey, skills, and what drives me as a developer
          </p>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <Card>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {profile.longBio}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {Object.entries(profile.stats).map(([key, value]) => (
            <motion.div key={key} variants={itemVariants}>
              <Card className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {key === 'githubContributions'
                    ? `${(value as number).toLocaleString()}+`
                    : `${value}+`}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            My <span className="gradient-text">Skills</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category) => {
              const categorySkills = skillsData.filter(
                (skill) => skill.category === category
              )
              const Icon = categoryIcons[category]

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <div className="flex items-center gap-3 mb-6">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      <h4 className="text-xl font-semibold">
                        {categoryLabels[category]}
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {categorySkills.map((skill) => (
                        <ProgressBar
                          key={skill.name}
                          label={skill.name}
                          value={skill.proficiency}
                        />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

