# How to Add Project Images

## Quick Guide

### 1. Prepare Your Images

- **Recommended size**: 1200x675px (16:9 aspect ratio)
- **Formats**: JPG, PNG, or WebP
- **File size**: Keep under 500KB for better performance

### 2. Add Images to the Project Folder

Place your images in: `public/images/projects/`

### 3. Match File Names with Project Image Paths

Your current projects expect these image files:

| Project | Expected Image File |
|---------|---------------------|
| Nebula Security Labs | `nebula-security-labs.jpg` |
| SecureHawk Password Toolkit | `SecureHawk---Password-toolkit.jpg` |
| MetaData Tool | `MetaData-Tool.jpg` |

### 4. Using Different File Names

If you want to use different file names, edit `data/projects.ts` and update the `image` field:

```typescript
{
  id: '1114980182',
  title: 'Nebula Security Labs',
  image: '/images/projects/your-custom-name.jpg', // ← Update this path
  // ... rest of project data
}
```

**Important**: The path must start with `/images/projects/` and match the actual file name in the folder.

## Examples

### Example 1: Using the Expected Names (Easiest)

1. Take a screenshot or export an image of your project
2. Resize to 1200x675px (use tools like Paint, Photoshop, GIMP, or online tools)
3. Save as `nebula-security-labs.jpg` in `public/images/projects/`
4. Repeat for other projects

### Example 2: Using Custom Names

1. Save your image as `nebula-screenshot.png` in `public/images/projects/`
2. Open `data/projects.ts`
3. Find the Nebula Security Labs project
4. Change:
   ```typescript
   image: '/images/projects/nebula-security-labs.jpg',
   ```
   to:
   ```typescript
   image: '/images/projects/nebula-screenshot.png',
   ```

## Image Path Format

All image paths in `data/projects.ts` should follow this format:
```typescript
image: '/images/projects/filename.jpg'
```

- Always start with `/images/projects/`
- Use the exact file name (case-sensitive)
- Include the file extension (.jpg, .png, .webp)

## Where Images Are Used

Project images appear in:
- Project cards on the Projects page
- Project detail modals when you click on a project
- Featured projects section (if marked as featured)

## Tips

1. **Use consistent naming**: Keep file names descriptive and consistent
2. **Optimize images**: Compress images to reduce file size while maintaining quality
3. **Use WebP for better performance**: Modern format with better compression
4. **Take good screenshots**: Show the best parts of your project
5. **Keep aspect ratio**: 16:9 works best for the portfolio layout

## Troubleshooting

**Image not showing?**
- Check the file name matches exactly (including case)
- Ensure the file is in `public/images/projects/` folder
- Verify the path in `data/projects.ts` starts with `/images/projects/`
- Check browser console for 404 errors

**Image too large/small?**
- Resize your image to 1200x675px before uploading
- Next.js will optimize it automatically, but starting with the right size helps

**Want to use a placeholder?**
- You can use placeholder services temporarily: `https://via.placeholder.com/1200x675`
- Or leave a blank/default image until you have screenshots ready

