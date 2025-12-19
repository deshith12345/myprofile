# Quick Start Guide

## ✅ All Files Are Ready!

Your portfolio website has been fully created with all components and configurations.

## 🚀 Installation Steps

### Step 1: Install Node.js (if not already installed)

1. Download Node.js from: https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Restart your terminal/command prompt after installation
4. Verify installation by running: `node --version` and `npm --version`

### Step 2: Install Dependencies

**Option A: Using Command Line**
```bash
cd portfolio
npm install
```

**Option B: Using the Batch Script (Windows)**
Double-click `install.bat` in the portfolio folder

### Step 3: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Edit `.env.local` and add your:
   - Site URL
   - Resend API key (for contact form)
   - Contact email
   - Other optional settings

### Step 4: Customize Your Content

Edit these files in the `data/` folder:
- `profile.ts` - Your personal information
- `projects.ts` - Your projects
- `achievements.ts` - Your achievements  
- `skills.ts` - Your skills

### Step 5: Add Your Assets

- Replace `public/profile.jpg` with your photo
- Add project images to `public/images/projects/`
- Replace `public/resume.pdf` with your resume
- Create `public/og-image.jpg` (1200x630px) for social sharing

### Step 6: Run Development Server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

## 📝 What's Included

✅ Complete Next.js 14+ setup with TypeScript
✅ All sections: Hero, About, Projects, Achievements, Contact
✅ Dark/Light mode toggle
✅ Responsive design
✅ SEO optimization
✅ Contact form with email integration
✅ Animations and smooth transitions
✅ Project filtering and modals
✅ Skills showcase with progress bars

## 🆘 Troubleshooting

**npm is not recognized:**
- Install Node.js from nodejs.org
- Restart your terminal after installation

**Cannot find portfolio directory:**
- Make sure you're in the correct directory
- Check that all files were created properly

**Build errors:**
- Make sure all dependencies are installed: `npm install`
- Check that environment variables are set
- Review error messages in the terminal

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.

---

**Ready to go! Just install Node.js and run `npm install` in the portfolio directory.** 🎉

