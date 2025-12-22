// TypeScript interfaces for all data structures

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  images?: string[];
  technologies: string[];
  category: 'web' | 'mobile' | 'opensource' | 'other';
  featured: boolean;
  role?: string;
  status?: string;
  challenges?: string[];
  liveUrl?: string;
  githubUrl?: string;
  date: string;
  highlights: string[];
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  icon: string;
  verificationUrl?: string;
  certificateFile?: string;
  organizationLogo?: string;
  category: AchievementCategory;
}

export type AchievementCategory = 'award' | 'certification' | 'publication' | 'speaking';

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'soft' | 'security-tools' | 'programming';
  proficiency: number; // 1-100
  icon?: string;
  isBrandIcon?: boolean;
  brandColor?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  longBio?: string;
  location: string;
  timezone: string;
  email: string;
  image: string;
  resume: string;
  socialLinks: SocialLink[];
  available: boolean;
  availabilityText: string;
  roles?: string[];
  stats?: {
    certifications: number;
    securityAssessments: number;
    vulnerabilitiesFound: number;
    toolsMastered: number;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  tags: string[];
  image?: string;
  featured?: boolean;
}



