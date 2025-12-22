import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Projects } from '@/components/Projects'
import { Achievements } from '@/components/Achievements'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { StructuredData } from '@/components/StructuredData'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Fallback data
import { profile as defaultProfile } from '@/data/profile'
import { projects as defaultProjects } from '@/data/projects'
import { skills as defaultSkills } from '@/data/skills'
import { achievements as defaultAchievements } from '@/data/achievements'
import { badges as defaultBadges } from '@/data/badges'
import { Badges } from '@/components/Badges'

async function getData() {
  try {
    const db = await getDb()
    const config = await db.collection('config').find({}).toArray()

    const dataMap = config.reduce((acc: any, item: any) => {
      acc[item.type] = item.data
      return acc
    }, {})

    return {
      profile: dataMap.profile || defaultProfile,
      projects: dataMap.projects || defaultProjects,
      skills: dataMap.skills || defaultSkills,
      achievements: dataMap.achievements || defaultAchievements,
      badges: dataMap.badges || defaultBadges,
    }
  } catch (error) {
    console.error('Failed to fetch data from MongoDB, using fallbacks:', error)
    return {
      profile: defaultProfile,
      projects: defaultProjects,
      skills: defaultSkills,
      achievements: defaultAchievements,
      badges: defaultBadges,
    }
  }
}

export default async function Home() {
  const { profile, projects, skills, achievements, badges } = await getData()

  return (
    <main className="min-h-screen">
      <StructuredData profile={profile} />
      <Header profile={profile} />
      <Hero profile={profile} />
      <About skills={skills} />
      <Projects projects={projects} />
      <Achievements achievements={achievements} />
      <Badges badges={badges} />
      <Contact profile={profile} />
      <Footer profile={profile} />
    </main>
  )
}

