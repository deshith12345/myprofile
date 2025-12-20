// Skills data - Focused on core cybersecurity and development
export interface Skill {
  name: string
  category: 'security-tools' | 'programming'
  proficiency: number // 1-100
  icon?: string // Lucide icon name or Simple Icon slug
  isBrandIcon?: boolean
  brandColor?: string
}

export const skills: Skill[] = [
  // Security Tools (The Security Stack)
  { name: 'Wireshark', category: 'security-tools', proficiency: 85, icon: 'wireshark', isBrandIcon: true, brandColor: '1679A7' },
  { name: 'Metasploit', category: 'security-tools', proficiency: 80, icon: 'metasploit', isBrandIcon: true, brandColor: '246EB9' },
  { name: 'Nmap', category: 'security-tools', proficiency: 90, icon: 'target', isBrandIcon: false },
  { name: 'Burp Suite', category: 'security-tools', proficiency: 82, icon: 'burpsuite', isBrandIcon: true, brandColor: 'FF6633' },
  { name: 'Splunk', category: 'security-tools', proficiency: 85, icon: 'splunk', isBrandIcon: true, brandColor: '000000' },
  { name: 'Kali Linux', category: 'security-tools', proficiency: 88, icon: 'kalilinux', isBrandIcon: true, brandColor: '557C94' },
  { name: 'Nessus', category: 'security-tools', proficiency: 78, icon: 'shield-alert', isBrandIcon: false },

  // Programming & Scripting (Dev & Scripting)
  { name: 'Python', category: 'programming', proficiency: 90, icon: 'python', isBrandIcon: true, brandColor: '3776AB' },
  { name: 'Bash', category: 'programming', proficiency: 85, icon: 'gnubash', isBrandIcon: true, brandColor: '4EAA25' },
  { name: 'PowerShell', category: 'programming', proficiency: 80, icon: 'powershell', isBrandIcon: true, brandColor: '5391FE' },
  { name: 'JavaScript', category: 'programming', proficiency: 75, icon: 'javascript', isBrandIcon: true, brandColor: 'F7DF1E' },
  { name: 'SQL', category: 'programming', proficiency: 82, icon: 'database', isBrandIcon: false },
  { name: 'Git', category: 'programming', proficiency: 88, icon: 'git', isBrandIcon: true, brandColor: 'F05032' },
]
