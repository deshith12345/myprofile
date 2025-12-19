# Installation Help Guide

## Current Status

✅ All portfolio files have been created successfully!
❌ Node.js/npm is not currently installed or not in your PATH

## Step-by-Step Installation

### Step 1: Install Node.js

**Download Node.js:**
1. Go to: https://nodejs.org/
2. Download the **LTS (Long Term Support)** version (recommended)
3. Run the installer
4. **Important:** Make sure to check "Add to PATH" during installation
5. Restart your terminal/command prompt after installation

**Verify Installation:**
After installing, open a NEW terminal/command prompt and run:
```bash
node --version
npm --version
```

You should see version numbers if Node.js is installed correctly.

### Step 2: Navigate to Portfolio Directory

The portfolio folder should be located at:
- `C:\Users\Deshith\portfolio\` (if files were created there)
- Or wherever you saved the portfolio project

**In Command Prompt/PowerShell:**
```bash
cd portfolio
```

**Or if you're not sure where it is:**
```bash
# Search for the portfolio folder
dir /s /b portfolio
# Or in PowerShell:
Get-ChildItem -Path C:\Users\Deshith -Filter "portfolio" -Directory -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

### Step 3: Install Dependencies

Once you're in the portfolio directory, run:
```bash
npm install
```

This will install all required packages (Next.js, React, TypeScript, etc.)

### Step 4: Set Up Environment Variables

1. Copy the example file:
   ```bash
   copy .env.local.example .env.local
   ```
   Or in PowerShell:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Edit `.env.local` with your information:
   - `NEXT_PUBLIC_SITE_URL` - Your website URL (e.g., https://yourname.vercel.app)
   - `RESEND_API_KEY` - Get from https://resend.com/api-keys (for contact form)
   - `CONTACT_EMAIL` - Your email address

### Step 5: Run Development Server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Common Issues & Solutions

### Issue: "npm is not recognized"

**Solution:**
- Install Node.js from nodejs.org
- Restart your terminal after installation
- Make sure Node.js was added to PATH during installation
- Try opening a NEW terminal window

### Issue: "Cannot find portfolio directory"

**Solution:**
1. Check where you saved the files
2. Use Windows Explorer to find the folder with `package.json`
3. Right-click in that folder → "Open in Terminal" or "Open PowerShell window here"
4. Or manually navigate: `cd path\to\portfolio`

### Issue: "npm install fails with errors"

**Solution:**
- Make sure you have internet connection
- Try: `npm cache clean --force` then `npm install` again
- Check Node.js version (should be 18.x or higher): `node --version`
- Update npm: `npm install -g npm@latest`

### Issue: "Permission denied" errors

**Solution (Windows):**
- Run terminal as Administrator
- Or disable antivirus temporarily (some antivirus software blocks npm)

### Issue: "Port 3000 already in use"

**Solution:**
- Close other applications using port 3000
- Or use a different port: `npm run dev -- -p 3001`

## Alternative: Use Windows Package Manager

If you prefer, you can install Node.js using winget (Windows Package Manager):

```powershell
winget install OpenJS.NodeJS.LTS
```

Then restart your terminal and proceed with `npm install`.

## Quick Test

After installation, test everything works:

```bash
# Navigate to portfolio
cd portfolio

# Install dependencies
npm install

# Run dev server
npm run dev
```

If you see "Ready" and "Local: http://localhost:3000", you're all set! 🎉

## Still Need Help?

If you encounter any specific errors, please share:
1. The exact error message
2. What command you ran
3. Your Node.js version (`node --version`)
4. Your npm version (`npm --version`)

---

**Next Steps After Installation:**
1. Customize content in `data/` folder
2. Add your images to `public/` folder
3. Set up environment variables
4. Deploy to Vercel (see README.md)

