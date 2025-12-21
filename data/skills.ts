export interface Skill {
  name: string
  category: 'security-tools' | 'programming' | 'security-concepts' | 'cloud-security' | 'compliance'
  proficiency: number
  icon?: string
  isBrandIcon?: boolean
  brandColor?: string
}

export const skills: Skill[] = [
  {
    "name": "Wireshark",
    "category": "security-tools",
    "proficiency": 85,
    "icon": "wireshark",
    "isBrandIcon": true,
    "brandColor": "1679A7"
  },
  {
    "name": "Metasploit",
    "category": "security-tools",
    "proficiency": 80,
    "icon": "metasploit",
    "isBrandIcon": true,
    "brandColor": "246EB9"
  },
  {
    "name": "Nmap",
    "category": "security-tools",
    "proficiency": 90,
    "icon": "target",
    "isBrandIcon": false
  },
  {
    "name": "Burp Suite",
    "category": "security-tools",
    "proficiency": 82,
    "icon": "burpsuite",
    "isBrandIcon": true,
    "brandColor": "FF6633"
  },
  {
    "name": "Splunk",
    "category": "security-tools",
    "proficiency": 85,
    "icon": "splunk",
    "isBrandIcon": true,
    "brandColor": "000000"
  },
  {
    "name": "Kali Linux",
    "category": "security-tools",
    "proficiency": 88,
    "icon": "kalilinux",
    "isBrandIcon": true,
    "brandColor": "557C94"
  },
  {
    "name": "Nessus",
    "category": "security-tools",
    "proficiency": 78,
    "icon": "nessus",
    "isBrandIcon": true,
    "brandColor": "003F59"
  },
  {
    "name": "Python",
    "category": "programming",
    "proficiency": 90,
    "icon": "python",
    "isBrandIcon": true,
    "brandColor": "3776AB"
  },
  {
    "name": "Bash",
    "category": "programming",
    "proficiency": 85,
    "icon": "gnubash",
    "isBrandIcon": true,
    "brandColor": "4EAA25"
  },
  {
    "name": "JavaScript",
    "category": "programming",
    "proficiency": 75,
    "icon": "javascript",
    "isBrandIcon": true,
    "brandColor": "666666"
  },
  {
    "name": "SQL",
    "category": "programming",
    "proficiency": 82,
    "icon": "sqlite",
    "isBrandIcon": true,
    "brandColor": "003B57"
  },
  {
    "name": "Git",
    "category": "programming",
    "proficiency": 88,
    "icon": "git",
    "isBrandIcon": true,
    "brandColor": "F05032"
  },
  {
    "name": "c++",
    "category": "programming",
    "proficiency": 50,
    "icon": "cplusplus",
    "isBrandIcon": true,
    "brandColor": "00599C"
  },
  {
    "name": "microsoft powershell",
    "category": "security-tools",
    "proficiency": 50,
    "icon": "microsoftpowershell",
    "isBrandIcon": true,
    "brandColor": "666666"
  },
  {
    "name": "owaspzap",
    "category": "security-tools",
    "proficiency": 50,
    "icon": "owaspzap",
    "isBrandIcon": true,
    "brandColor": "666666"
  }
]