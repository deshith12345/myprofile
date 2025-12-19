import { profile } from '@/data/profile'

// Structured data for SEO (JSON-LD Schema)
export function StructuredData() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://deshith-deemantha.vercel.app',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshith-deemantha.vercel.app'}/profile.jpg`,
    jobTitle: profile.title,
    description: profile.bio,
    sameAs: profile.socialLinks
      .filter((link) => link.platform !== 'Email')
      .map((link) => link.url),
    knowsAbout: ['Web Development', 'React', 'Node.js', 'TypeScript', 'Next.js'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.split(',')[0],
      addressRegion: profile.location.split(',')[1]?.trim() || '',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  )
}

// Structured data for individual projects
export function ProjectSchema({ project }: { project: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    author: {
      '@type': 'Person',
      name: profile.name,
    },
    datePublished: project.date,
    url: project.liveUrl || project.githubUrl,
    keywords: project.technologies.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

