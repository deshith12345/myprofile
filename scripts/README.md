# GitHub Projects Import Script

This script imports your GitHub repositories and converts them into projects for your portfolio.

## Usage

### Basic Usage
```bash
npm run import:github <username>
```

Example:
```bash
npm run import:github deshith12345
```

### With GitHub Token (Optional)
For higher rate limits and access to private repos (if needed), set a GitHub token:

```bash
# Windows PowerShell
$env:GITHUB_TOKEN="your_token_here"
npm run import:github deshith12345

# Or use environment variable in .env.local
GITHUB_TOKEN=your_token_here npm run import:github deshith12345
```

## What it does

1. Fetches all public repositories from the specified GitHub username
2. Filters out archived, disabled, and private repositories
3. Transforms repository data to match the Project interface:
   - Extracts technologies from repository topics and languages
   - Determines project category (web, mobile, opensource, other)
   - Marks projects as featured if they have >5 stars or >3 forks
   - Generates highlights from repository stats and description
4. Updates `data/projects.ts` with the imported projects

## After Importing

1. **Review and customize** `data/projects.ts`:
   - Edit descriptions and long descriptions
   - Update categories if needed
   - Mark additional projects as featured
   - Add or remove highlights
   - Update technologies list

2. **Add project images** to `public/images/projects/`:
   - The script sets placeholder image paths like `/images/projects/project-name.jpg`
   - Add actual screenshots/images for each project
   - Recommended size: 1200x675px (16:9 aspect ratio)

3. **Add live URLs** if available:
   - Update the `liveUrl` field for projects with deployed versions

## Notes

- The script completely replaces the contents of `data/projects.ts`
- To keep existing projects, back up the file before running
- Projects are sorted by most recently updated
- Images need to be added manually after import

