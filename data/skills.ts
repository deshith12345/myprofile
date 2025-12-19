// Skills data - Edit this to reflect your actual skills
export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools' | 'soft'
  proficiency: number // 1-100
  icon?: string
}

export const skills: Skill[] = [
  // Frontend Skills
  { name: 'React', category: 'frontend', proficiency: 95, icon: 'react' },
  { name: 'Next.js', category: 'frontend', proficiency: 90, icon: 'nextjs' },
  { name: 'TypeScript', category: 'frontend', proficiency: 92, icon: 'typescript' },
  { name: 'JavaScript', category: 'frontend', proficiency: 95, icon: 'javascript' },
  { name: 'HTML/CSS', category: 'frontend', proficiency: 98, icon: 'html' },
  { name: 'Tailwind CSS', category: 'frontend', proficiency: 90, icon: 'tailwind' },
  { name: 'Framer Motion', category: 'frontend', proficiency: 85, icon: 'framer' },
  
  // Backend Skills
  { name: 'Node.js', category: 'backend', proficiency: 88, icon: 'nodejs' },
  { name: 'Express', category: 'backend', proficiency: 85, icon: 'express' },
  { name: 'Python', category: 'backend', proficiency: 80, icon: 'python' },
  { name: 'PostgreSQL', category: 'backend', proficiency: 82, icon: 'postgresql' },
  { name: 'MongoDB', category: 'backend', proficiency: 85, icon: 'mongodb' },
  { name: 'GraphQL', category: 'backend', proficiency: 78, icon: 'graphql' },
  { name: 'REST APIs', category: 'backend', proficiency: 92, icon: 'api' },
  
  // Tools
  { name: 'Git', category: 'tools', proficiency: 95, icon: 'git' },
  { name: 'Docker', category: 'tools', proficiency: 80, icon: 'docker' },
  { name: 'AWS', category: 'tools', proficiency: 75, icon: 'aws' },
  { name: 'Vercel', category: 'tools', proficiency: 90, icon: 'vercel' },
  { name: 'CI/CD', category: 'tools', proficiency: 85, icon: 'cicd' },
  { name: 'VS Code', category: 'tools', proficiency: 95, icon: 'vscode' },
  
  // Soft Skills
  { name: 'Problem Solving', category: 'soft', proficiency: 95 },
  { name: 'Team Collaboration', category: 'soft', proficiency: 90 },
  { name: 'Communication', category: 'soft', proficiency: 88 },
  { name: 'Project Management', category: 'soft', proficiency: 85 },
  { name: 'Mentoring', category: 'soft', proficiency: 80 },
]
