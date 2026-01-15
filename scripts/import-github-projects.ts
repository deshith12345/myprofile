import fs from 'fs'
import path from 'path'

// GitHub API types
interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  languages_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  forks_count: number
  archived: boolean
  disabled: boolean
  private: boolean
}

interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  technologies: string[]
  category: 'web' | 'mobile' | 'opensource' | 'other'
  featured: boolean
  liveUrl?: string
  githubUrl: string
  date: string
  highlights: string[]
}

// Technology mapping - maps GitHub topics/languages to display names
const technologyMap: Record<string, string> = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'react': 'React',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'cpp': 'C++',
  'html': 'HTML',
  'css': 'CSS',
  'tailwindcss': 'Tailwind CSS',
  'tailwind': 'Tailwind CSS',
  'vue': 'Vue.js',
  'angular': 'Angular',
  'svelte': 'Svelte',
  'express': 'Express',
  'nestjs': 'NestJS',
  'fastapi': 'FastAPI',
  'django': 'Django',
  'flask': 'Flask',
  'spring': 'Spring',
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  'redis': 'Redis',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'firebase': 'Firebase',
  'supabase': 'Supabase',
  'react-native': 'React Native',
  'flutter': 'Flutter',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'graphql': 'GraphQL',
  'rest-api': 'REST API',
  'redux': 'Redux',
  'zustand': 'Zustand',
  'prisma': 'Prisma',
  'typeorm': 'TypeORM',
  'jest': 'Jest',
  'cypress': 'Cypress',
  'playwright': 'Playwright',
}

// Category detection based on topics and language
function detectCategory(repo: GitHubRepo): 'web' | 'mobile' | 'opensource' | 'other' {
  const topics = repo.topics.map(t => t.toLowerCase())
  const name = repo.name.toLowerCase()
  const desc = (repo.description || '').toLowerCase()

  // Mobile detection
  if (
    topics.some(t => ['mobile', 'react-native', 'flutter', 'ios', 'android', 'swift', 'kotlin'].includes(t)) ||
    name.includes('mobile') ||
    desc.includes('mobile app')
  ) {
    return 'mobile'
  }

  // Open source detection
  if (
    topics.some(t => ['open-source', 'opensource', 'library', 'package', 'npm', 'pypi'].includes(t)) ||
    repo.stargazers_count > 10
  ) {
    return 'opensource'
  }

  // Web detection
  if (
    topics.some(t => ['web', 'website', 'webapp', 'frontend', 'backend', 'fullstack'].includes(t)) ||
    name.includes('web') ||
    desc.includes('web') ||
    repo.language === 'JavaScript' ||
    repo.language === 'TypeScript' ||
    repo.language === 'HTML'
  ) {
    return 'web'
  }

  return 'other'
}

// Extract technologies from topics and language
function extractTechnologies(repo: GitHubRepo, languages: Record<string, number>): string[] {
  const techSet = new Set<string>()

  // Add technologies from topics
  repo.topics.forEach(topic => {
    const normalized = topic.toLowerCase().replace(/-/g, '').replace(/_/g, '')
    if (technologyMap[normalized]) {
      techSet.add(technologyMap[normalized])
    } else if (technologyMap[topic.toLowerCase()]) {
      techSet.add(technologyMap[topic.toLowerCase()])
    }
  })

  // Add main language if it exists
  if (repo.language && technologyMap[repo.language.toLowerCase()]) {
    techSet.add(technologyMap[repo.language.toLowerCase()])
  } else if (repo.language) {
    techSet.add(repo.language)
  }

  // Add top languages from languages API
  const sortedLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang)

  sortedLanguages.forEach(lang => {
    const normalized = lang.toLowerCase()
    if (technologyMap[normalized]) {
      techSet.add(technologyMap[normalized])
    } else {
      techSet.add(lang)
    }
  })

  return Array.from(techSet).slice(0, 8) // Limit to 8 technologies
}

// Generate highlights from repository data
function generateHighlights(repo: GitHubRepo): string[] {
  const highlights: string[] = []

  if (repo.stargazers_count > 0) {
    highlights.push(`${repo.stargazers_count} ${repo.stargazers_count === 1 ? 'star' : 'stars'}`)
  }

  if (repo.forks_count > 0) {
    highlights.push(`${repo.forks_count} ${repo.forks_count === 1 ? 'fork' : 'forks'}`)
  }

  if (repo.topics.length > 0) {
    highlights.push(`Featured topics: ${repo.topics.slice(0, 3).join(', ')}`)
  }

  if (!repo.archived && !repo.disabled) {
    highlights.push('Active development')
  }

  if (repo.description) {
    const descWords = repo.description.split(' ').slice(0, 5).join(' ')
    highlights.push(descWords)
  }

  return highlights.slice(0, 5) // Limit to 5 highlights
}

// Fetch languages for a repository
async function fetchLanguages(languagesUrl: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(languagesUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return {}
    }

    return await response.json()
  } catch (error) {
    console.warn(`Failed to fetch languages from ${languagesUrl}:`, error)
    return {}
  }
}

// Transform GitHub repo to Project
async function transformRepo(repo: GitHubRepo): Promise<Project> {
  const languages = await fetchLanguages(repo.languages_url)
  const technologies = extractTechnologies(repo, languages)

  // Format date (use pushed_at as the most recent activity date)
  const date = new Date(repo.pushed_at).toISOString().split('T')[0]

  // Generate title (remove username prefix if present, format nicely)
  const title = repo.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Use description or generate one
  const description = repo.description || `A ${repo.language || 'software'} project`
  const longDescription = repo.description
    ? `${repo.description}\n\nThis project is available on GitHub with ${repo.stargazers_count} ${repo.stargazers_count === 1 ? 'star' : 'stars'} and ${repo.forks_count} ${repo.forks_count === 1 ? 'fork' : 'forks'}.`
    : `A ${repo.language || 'software'} project available on GitHub.`

  // Determine if featured (stars > 5 or forks > 3)
  const featured = repo.stargazers_count > 5 || repo.forks_count > 3

  // Use GitHub's social preview image or placeholder
  const image = `/images/projects/${repo.name}.jpg` // Placeholder path

  return {
    id: repo.id.toString(),
    title,
    description,
    longDescription,
    image,
    technologies: technologies.length > 0 ? technologies : [repo.language || 'Other'],
    category: detectCategory(repo),
    featured,
    liveUrl: repo.homepage || undefined,
    githubUrl: repo.html_url,
    date,
    highlights: generateHighlights(repo),
  }
}

// Main function
async function importGitHubProjects(username: string, githubToken?: string) {
  console.log(`Fetching repositories for ${username}...`)

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  }

  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
  }

  try {
    // Fetch repositories
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers,
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User ${username} not found on GitHub`)
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const repos: GitHubRepo[] = await response.json()

    // Filter out archived, disabled, and private repos
    const publicRepos = repos.filter(repo => !repo.archived && !repo.disabled && !repo.private)

    console.log(`Found ${publicRepos.length} public repositories`)

    if (publicRepos.length === 0) {
      console.log('No public repositories found to import.')
      return
    }

    // Transform repositories to projects
    console.log('Transforming repositories to projects...')
    const projects: Project[] = []

    for (const repo of publicRepos) {
      try {
        const project = await transformRepo(repo)
        projects.push(project)
        console.log(`✓ Imported: ${project.title}`)
      } catch (error) {
        console.error(`✗ Failed to import ${repo.name}:`, error)
      }

      // Rate limiting - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Helper to escape strings for TypeScript
    const escapeString = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .trim()
    }

    // Generate projects.ts file content
    const formatProject = (project: Project): string => {
      const lines: string[] = []
      lines.push(`  {`)
      lines.push(`    id: '${escapeString(project.id)}',`)
      lines.push(`    title: '${escapeString(project.title)}',`)
      lines.push(`    description: '${escapeString(project.description)}',`)
      
      // Handle longDescription with template literal for multiline support
      const longDescEscaped = project.longDescription
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\${/g, '\\${')
      lines.push(`    longDescription: \`${longDescEscaped}\`,`)
      
      lines.push(`    image: '${escapeString(project.image)}',`)
      lines.push(`    technologies: [${project.technologies.map(t => `'${escapeString(t)}'`).join(', ')}],`)
      lines.push(`    category: '${project.category}',`)
      lines.push(`    featured: ${project.featured},`)
      
      if (project.liveUrl) {
        lines.push(`    liveUrl: '${escapeString(project.liveUrl)}',`)
      }
      
      lines.push(`    githubUrl: '${escapeString(project.githubUrl || '')}',`)
      lines.push(`    date: '${escapeString(project.date)}',`)
      lines.push(`    highlights: [${project.highlights.map(h => `'${escapeString(h)}'`).join(', ')}],`)
      lines.push(`  },`)
      
      return lines.join('\n')
    }

    const fileContent = `// Projects data - Imported from GitHub
// Generated automatically - you can edit this file to customize projects
export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  technologies: string[]
  category: 'web' | 'mobile' | 'opensource' | 'other'
  featured: boolean
  liveUrl?: string
  githubUrl?: string
  date: string
  highlights: string[]
}

export const projects: Project[] = [
${projects.map(formatProject).join('\n')}
]
`

    // Write to file
    const filePath = path.join(process.cwd(), 'data', 'projects.ts')
    fs.writeFileSync(filePath, fileContent, 'utf-8')

    console.log(`\n✓ Successfully imported ${projects.length} projects to data/projects.ts`)
    console.log(`\nNote: Project images need to be added manually to public/images/projects/`)
    console.log(`You can customize the imported projects in data/projects.ts`)
  } catch (error) {
    console.error('Error importing projects:', error)
    process.exit(1)
  }
}

// Run script
const username = process.argv[2] || process.env.GITHUB_USERNAME || 'deshith12345'
const githubToken = process.env.GITHUB_TOKEN

if (!username) {
  console.error('Usage: npm run import:github <username>')
  console.error('Or set GITHUB_USERNAME environment variable')
  console.error('Optional: Set GITHUB_TOKEN environment variable for higher rate limits')
  process.exit(1)
}

importGitHubProjects(username, githubToken)

