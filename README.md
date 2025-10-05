# Daniel Fridljand's Academic Website

This is my personal academic website built with Hugo Blox Builder using the Academic CV template with Tailwind CSS v4.

## 🚀 Quick Start

### Prerequisites
- Hugo Extended v0.150.1+
- Node.js 18+
- pnpm

### Installation
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
# or
hugo server --disableFastRender
```

### Build for Production
```bash
pnpm build
# or
hugo --minify
```

## 📁 Content Structure

### Homepage
- `content/_index.md` - Main homepage with block-based sections

### Author Profile
- `content/authors/admin/_index.md` - Author information, education, work experience, skills, awards

### Blog Posts
- `content/blog/` - All blog posts (migrated from `content/post/`)
  - `mutational-signature-with-hierarchical-dirichlet-process/`
  - `mapping-mutational-signatures-to-trees/`

### Publications
- `content/publications/` - All publications (migrated from `content/publication/`)
  - `preprint/` - Preprint publications

### Projects
- `content/projects/` - Project showcases (migrated from `content/project/`)
  - `example/`
  - `external-project/`

### Events/Talks
- `content/events/` - Events and talks (migrated from `content/event/`)
  - `dagstat/`
  - `ibs_lecture_series/`
  - `imbi/`
  - `theory@embl/`

### Experience
- `content/experience.md` - Detailed professional experience page

### Assets
- `static/uploads/resume.pdf` - CV/Resume
- `assets/media/icons/brands/` - Company logos and brand icons
- `assets/media/` - Images and media files

## ⚙️ Configuration

### Main Configuration Files
- `config/_default/hugo.yaml` - Hugo configuration
- `config/_default/params.yaml` - Site parameters and appearance
- `config/_default/menus.yaml` - Navigation menu
- `config/_default/module.yaml` - Hugo modules (Tailwind CSS, Netlify plugin)

### Build Configuration
- `go.mod` - Hugo modules dependencies
- `package.json` - Node.js dependencies (Tailwind CSS v4)
- `hugoblox.yaml` - Hugo Blox template metadata

## 🔄 Migration Notes

This site was migrated from the 2022 HugoBlox template to the 2025 template with the following changes:

### Structural Changes
- **CSS Framework**: Bootstrap v5 → Tailwind CSS v4
- **Content Organization**: 
  - `content/post/` → `content/blog/`
  - `content/publication/` → `content/publications/`
  - `content/project/` → `content/projects/`
  - `content/event/` → `content/events/`
- **Homepage**: Widget-based (`content/home/*.md`) → Block-based single file (`content/_index.md`)
- **Author Profile**: Enhanced structure with new sections (work, education, skills, awards)

### URL Redirects
Old URLs are automatically redirected:
- `/post/*` → `/blog/*`
- `/publication/*` → `/publications/*`
- `/project/*` → `/projects/*`
- `/event/*` → `/events/*`

## 🛠️ Development

### Custom Scripts
- `scripts/copy_from_obsidian.sh` - Script to copy content from Obsidian (updated for new blog path)

### GitHub Actions
- `.github/workflows/publish.yaml` - Automated deployment to GitHub Pages with Tailwind CSS build

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📝 Content Management

### Adding Blog Posts
1. Create new directory in `content/blog/`
2. Add `index.md` with front matter
3. Include any media files in the same directory

### Adding Publications
1. Create new directory in `content/publications/`
2. Add `index.md` with publication details
3. Include `cite.bib` for BibTeX citation

### Updating Author Profile
Edit `content/authors/admin/_index.md` to update:
- Personal information
- Work experience
- Education
- Skills and interests
- Awards and achievements

### Updating Homepage
Edit `content/_index.md` to modify:
- Biography section
- Research description
- Publication collections
- Blog post collections

## 🚀 Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The GitHub Actions workflow:
1. Installs Node.js and pnpm
2. Installs Hugo Extended v0.150.1
3. Installs Tailwind CSS dependencies
4. Builds the site with Hugo
5. Deploys to GitHub Pages

## 📚 Resources

- [Hugo Blox Documentation](https://docs.hugoblox.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Hugo Documentation](https://gohugo.io/documentation/)