# Quick Setup Guide

This is a quick reference guide to get your portfolio up and running.

## Initial Setup (5 minutes)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your information.

3. **Add your content**:
   - Edit `data/profile.ts` - Your personal information
   - Edit `data/projects.ts` - Your projects
   - Edit `data/achievements.ts` - Your achievements
   - Edit `data/skills.ts` - Your skills

4. **Add your assets**:
   - Replace `public/profile.jpg` with your photo (recommended: 800x800px)
   - Replace `public/resume.pdf` with your resume
   - Add project images to `public/images/projects/`
   - Create `public/og-image.jpg` (1200x630px) for social sharing

5. **Run locally**:
   ```bash
   npm run dev
   ```

6. **Deploy to Vercel**:
   - Push to GitHub
   - Import in Vercel
   - Add environment variables
   - Deploy!

## Important Notes

- **Profile Image**: If `public/profile.jpg` doesn't exist, a gradient background will be shown
- **Project Images**: Make sure image paths in `data/projects.ts` match your actual files
- **Resume**: The download button links to `public/resume.pdf`
- **Email**: You need a Resend API key for the contact form to work

## Customization Checklist

- [ ] Update profile information
- [ ] Add your projects
- [ ] Add your achievements
- [ ] Update skills
- [ ] Replace profile image
- [ ] Replace resume PDF
- [ ] Add project images
- [ ] Create OG image
- [ ] Set up Resend API key
- [ ] Update social media links
- [ ] Customize colors (optional)
- [ ] Update favicon (optional)

## Need Help?

Check the main [README.md](README.md) for detailed documentation.

