# Personal Portfolio Website

A modern, fully-functional personal portfolio website built with Next.js 14+, TypeScript, Tailwind CSS, and optimized for Vercel deployment.

## 🚀 Features

- **Modern Design**: Beautiful UI with smooth animations and transitions
- **Dark/Light Mode**: Persistent theme switching with system preference detection
- **Fully Responsive**: Mobile-first design that works on all devices
- **SEO Optimized**: Complete SEO setup with metadata, structured data, sitemap, and robots.txt
- **Performance Optimized**: Fast loading times with image optimization and code splitting
- **Contact Form**: Working contact form with email integration via Resend
- **Project Showcase**: Filterable project gallery with detailed modals
- **Skills Display**: Visual skill representation with progress bars
- **Achievements Section**: Showcase your certifications, awards, and publications
- **Smooth Animations**: Powered by Framer Motion for engaging user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation
- **Email Service**: Resend API
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository** (or use this as a template):
   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   - `NEXT_PUBLIC_SITE_URL`: Your site URL (e.g., https://yourname.vercel.app)
   - `RESEND_API_KEY`: Your Resend API key (get it from https://resend.com/api-keys)
   - `CONTACT_EMAIL`: Email address where form submissions will be sent
   - `GOOGLE_VERIFICATION_CODE`: (Optional) For Google Search Console
   - `NEXT_PUBLIC_GA_ID`: (Optional) Google Analytics ID

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🎨 Customization

### 1. Personal Information

Edit `data/profile.ts` to update:
- Name, title, tagline
- Bio and long bio
- Location, timezone
- Social media links
- Email address
- Statistics (years of experience, projects completed, etc.)

### 2. Skills

Edit `data/skills.ts` to:
- Add or remove skills
- Update proficiency levels (1-100)
- Organize by category (frontend, backend, tools, soft)

### 3. Projects

Edit `data/projects.ts` to:
- Add your projects with all details
- Update project images (place them in `public/images/projects/`)
- Set featured projects
- Add links to live demos and GitHub repositories

### 4. Achievements

Edit `data/achievements.ts` to:
- Add certifications, awards, publications, speaking engagements
- Include verification links
- Update dates and descriptions

### 5. Colors & Styling

Edit `tailwind.config.ts` to customize:
- Primary and secondary colors
- Font families
- Animation timings
- Spacing and sizing

### 6. Resume/CV

Replace `public/resume.pdf` with your own resume file.

### 7. Profile Image

Replace `public/profile.jpg` with your professional photo (recommended: 800x800px, square).

### 8. Project Images

Add your project screenshots to `public/images/projects/` and update the image paths in `data/projects.ts`.

### 9. OG Image

Create an Open Graph image (`public/og-image.jpg`) with dimensions 1200x630px for social media sharing.

### 10. Favicon

Replace `public/favicon.ico` with your own favicon.

## 📧 Contact Form Setup

### Option 1: Resend (Recommended)

1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add it to `.env.local` as `RESEND_API_KEY`
4. Update the `from` email in `lib/email.ts` with a verified domain (or use `onboarding@resend.dev` for testing)

### Option 2: EmailJS (Alternative)

If you prefer EmailJS:

1. Sign up at [EmailJS](https://www.emailjs.com)
2. Set up your email service and template
3. Update the contact form to use EmailJS SDK instead of Resend

## 🚀 Deployment to Vercel

### Method 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables in the Vercel dashboard
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and add environment variables when asked.

### Environment Variables in Vercel

Make sure to add these environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `GOOGLE_VERIFICATION_CODE` (optional)
- `NEXT_PUBLIC_GA_ID` (optional)

## 🔍 SEO Optimization

This portfolio includes comprehensive SEO optimization:

- ✅ Next.js Metadata API with title templates
- ✅ JSON-LD structured data (Person Schema, CreativeWork Schema)
- ✅ Dynamic sitemap.xml generation
- ✅ Robots.txt configuration
- ✅ OpenGraph and Twitter Card meta tags
- ✅ Canonical URLs
- ✅ Image optimization with Next.js Image component
- ✅ Semantic HTML5 elements
- ✅ Proper heading hierarchy

### Post-Deployment SEO Checklist

After deploying, make sure to:

1. ✅ Submit sitemap to Google Search Console
   - Go to Google Search Console
   - Add your property
   - Submit `https://yourname.vercel.app/sitemap.xml`

2. ✅ Test with Google's Rich Results Test
   - Visit https://search.google.com/test/rich-results
   - Test your homepage URL

3. ✅ Validate structured data
   - Use Schema Markup Validator
   - Verify Person and CreativeWork schemas

4. ✅ Test mobile-friendliness
   - Use Google's Mobile-Friendly Test
   - Ensure all pages pass

5. ✅ Check page speed
   - Use PageSpeed Insights
   - Aim for scores above 90

6. ✅ Validate OG tags
   - Use opengraph.xyz to preview social sharing

7. ✅ Set up Google Analytics (if using)
   - Add tracking code
   - Set up goals and events

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # Contact form API route
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── sitemap.ts                 # Dynamic sitemap
│   └── robots.ts                  # Robots.txt
├── components/
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── ProgressBar.tsx
│   ├── Header.tsx                 # Navigation header
│   ├── Hero.tsx                   # Hero section
│   ├── About.tsx                  # About section
│   ├── Projects.tsx               # Projects section
│   ├── ProjectCard.tsx            # Project card component
│   ├── ProjectModal.tsx           # Project detail modal
│   ├── Achievements.tsx           # Achievements section
│   ├── Contact.tsx                # Contact section
│   ├── Footer.tsx                 # Footer
│   ├── ThemeToggle.tsx            # Dark/light mode toggle
│   └── StructuredData.tsx         # SEO structured data
├── data/
│   ├── profile.ts                 # Personal information
│   ├── projects.ts                # Projects data
│   ├── achievements.ts            # Achievements data
│   └── skills.ts                  # Skills data
├── lib/
│   ├── utils.ts                   # Utility functions
│   └── email.ts                   # Email sending logic
├── public/
│   ├── images/
│   │   └── projects/              # Project images
│   ├── profile.jpg                # Profile photo
│   ├── resume.pdf                 # Resume/CV
│   ├── og-image.jpg               # OG image for social sharing
│   └── favicon.ico                # Favicon
├── .env.local.example             # Environment variables template
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── vercel.json                    # Vercel configuration
```

## 🎯 Performance Tips

- Images are automatically optimized by Next.js
- Use WebP/AVIF formats when possible
- Lazy load images below the fold
- Minimize bundle size by importing only needed icons
- Use dynamic imports for heavy components

## 🐛 Troubleshooting

### Contact form not working

1. Check that `RESEND_API_KEY` is set in `.env.local`
2. Verify your Resend API key is valid
3. Check the browser console for errors
4. Verify the API route is accessible

### Images not loading

1. Ensure images are in the `public` directory
2. Use paths starting with `/` (e.g., `/images/projects/image.jpg`)
3. Check file names match exactly (case-sensitive)

### Build errors

1. Run `npm run lint` to check for errors
2. Ensure all environment variables are set
3. Check that all imports are correct
4. Verify TypeScript types are correct

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

## 📧 Support

If you have questions or need help, feel free to open an issue or reach out.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide](https://lucide.dev)
- Animations with [Framer Motion](https://www.framer.com/motion/)

---

**Happy coding! 🚀**

