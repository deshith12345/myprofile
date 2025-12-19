# How to Update Your Portfolio Details

This guide shows you exactly where to edit your personal information, projects, skills, and achievements.

## 📝 Quick Reference

All your data files are in the `data/` folder:
- `data/profile.ts` - Personal information
- `data/skills.ts` - Your skills
- `data/projects.ts` - Your projects
- `data/achievements.ts` - Certifications, awards, etc.

---

## 1. Personal Information (`data/profile.ts`)

Open `data/profile.ts` and update these fields:

```typescript
export const profile = {
  name: 'Your Name',                    // ← Your full name
  title: 'Full Stack Developer',        // ← Your job title/role
  tagline: 'Building modern...',        // ← Short tagline
  
  bio: `Your short bio here...`,        // ← Short bio (shown in hero)
  longBio: `Your longer bio...`,        // ← Detailed bio (shown in about)
  
  location: 'San Francisco, CA',        // ← Your location
  timezone: 'PST (UTC-8)',             // ← Your timezone
  available: true,                      // ← true/false
  availabilityText: 'Open to opportunities',  // ← Availability message
  
  email: 'your.email@example.com',     // ← Your email
  
  socialLinks: [
    {
      platform: 'GitHub',
      url: 'https://github.com/yourusername',  // ← Your GitHub
      icon: 'github',
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',  // ← Your LinkedIn
      icon: 'linkedin',
    },
    // Add more social links as needed
  ],
  
  stats: {
    yearsOfExperience: 5,              // ← Your years of experience
    projectsCompleted: 50,             // ← Number of projects
    happyClients: 30,                  // ← Happy clients count
    githubContributions: 1000,         // ← GitHub contributions
  },
}
```

### What to Update:
- ✅ Name, title, and tagline
- ✅ Bio and long bio
- ✅ Location and timezone
- ✅ Email address
- ✅ Social media links (GitHub, LinkedIn, Twitter, etc.)
- ✅ Statistics (experience, projects, clients)

---

## 2. Skills (`data/skills.ts`)

Open `data/skills.ts` to add/update your skills. Each skill has:
- `name`: Skill name
- `level`: Proficiency level (1-100)
- `category`: 'frontend', 'backend', 'tools', or 'soft'

### Example:
```typescript
{
  name: 'React',
  level: 90,           // ← 1-100 (proficiency percentage)
  category: 'frontend',
},
{
  name: 'Node.js',
  level: 85,
  category: 'backend',
},
```

### Categories:
- `frontend` - Frontend technologies
- `backend` - Backend technologies
- `tools` - Tools and utilities
- `soft` - Soft skills

---

## 3. Projects (`data/projects.ts`)

Open `data/projects.ts` to add/update your projects. Each project should have:

```typescript
{
  id: 'project-1',
  title: 'Project Name',
  description: 'Short description',
  longDescription: 'Detailed description...',
  image: '/images/projects/project1.jpg',  // ← Image path
  technologies: ['React', 'Node.js'],      // ← Technologies used
  category: 'web',                         // ← 'web', 'mobile', 'opensource', 'other'
  featured: true,                          // ← Show on homepage?
  liveUrl: 'https://project-demo.com',     // ← Live demo URL
  githubUrl: 'https://github.com/...',     // ← GitHub repo
  highlights: [                            // ← Key features
    'Feature 1',
    'Feature 2',
  ],
  startDate: '2024-01-01',                // ← Start date
  endDate: '2024-03-01',                  // ← End date (or 'present')
}
```

### To Add Project Images:
1. Place images in `public/images/projects/`
2. Update the `image` field with the path: `/images/projects/your-image.jpg`

---

## 4. Achievements (`data/achievements.ts`)

Open `data/achievements.ts` to add certifications, awards, publications, etc.

### Example:
```typescript
{
  id: 'cert-1',
  type: 'certification',              // ← 'certification', 'award', 'publication', 'speaking'
  title: 'AWS Certified Developer',
  issuer: 'Amazon Web Services',
  date: '2024-01-15',
  description: 'Cloud development certification',
  verificationUrl: 'https://verify-link.com',  // ← Verification link
  icon: 'certificate',                // ← Icon name
}
```

### Types:
- `certification` - Certifications and courses
- `award` - Awards and recognitions
- `publication` - Articles, blog posts, papers
- `speaking` - Speaking engagements, conferences

---

## 5. Profile Image

1. Replace `public/profile.jpg` with your professional photo
2. Recommended size: 800x800px (square)
3. Keep the filename as `profile.jpg`

---

## 6. Resume/CV

1. Replace `public/resume.pdf` with your resume
2. Keep the filename as `resume.pdf`
3. The download button will automatically link to this file

---

## 7. Project Images

1. Add project screenshots to `public/images/projects/`
2. Update image paths in `data/projects.ts`
3. Example: If you add `project1.png`, use `/images/projects/project1.png`

---

## 8. Social Media Sharing Image (OG Image)

1. Create an image: 1200x630px
2. Save it as `public/og-image.jpg`
3. This appears when your site is shared on social media

---

## ⚡ After Making Changes

1. **Save the files** you edited
2. The development server will **automatically reload** (hot reload)
3. **Refresh your browser** at http://localhost:3000 to see changes

No need to restart the server - changes appear automatically!

---

## 🎨 Optional: Customize Colors

To change the color scheme, edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#3B82F6',  // ← Main blue color
    // ... other shades
  },
  secondary: {
    DEFAULT: '#8B5CF6',  // ← Purple accent color
    // ... other shades
  },
}
```

---

## 📧 Contact Form Setup

To make the contact form work, you need to:

1. Create `.env.local` file (copy from `.env.local.example` if it exists)
2. Add your Resend API key:
   ```
   RESEND_API_KEY=your_api_key_here
   CONTACT_EMAIL=your.email@example.com
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

Get your Resend API key from: https://resend.com/api-keys

---

## ✅ Checklist

Use this checklist to ensure you've updated everything:

- [ ] Name, title, and tagline in `data/profile.ts`
- [ ] Bio and long bio
- [ ] Location and timezone
- [ ] Email address
- [ ] Social media links (GitHub, LinkedIn, Twitter)
- [ ] Statistics (experience, projects, clients)
- [ ] Skills in `data/skills.ts`
- [ ] Projects in `data/projects.ts`
- [ ] Project images in `public/images/projects/`
- [ ] Achievements in `data/achievements.ts`
- [ ] Profile image (`public/profile.jpg`)
- [ ] Resume (`public/resume.pdf`)
- [ ] OG image (`public/og-image.jpg`)
- [ ] Environment variables (for contact form)

---

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- All data files are in the `data/` folder
- The site auto-reloads when you save changes
- Refresh your browser to see updates

