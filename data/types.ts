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
  category: 'award' | 'certification' | 'publication' | 'speaking';
}

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'soft';
  proficiency: number; // 1-100
  icon?: string;
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
  bio: string[];
  location: string;
  timezone: string;
  email: string;
  photo: string;
  resumeUrl: string;
  socialLinks: SocialLink[];
  availability: boolean;
  availabilityText: string;
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



