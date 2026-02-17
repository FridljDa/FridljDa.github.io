# Personal Website

Astro-based personal website with AI chat functionality powered by Google Gemini API.

## Prerequisites

- Node.js (see `.nvmrc` or `package.json` engines for required version)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Copy `.env.sample` to `.env` and fill in the values:
   ```bash
   cp .env.sample .env
   ```
   - Required variables:
     - `GEMINI_API_KEY` - Your Google Gemini API key (get from https://aistudio.google.com/app/apikey)
     - `PUBLIC_SECRET_PASSWORD` - Secret password for the prompt injection hackathon challenge (used in the blog post)

3. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:4321`.

## Features

- **Server-Side Rendering (SSR)** - Built with Astro 5.x SSR mode
- **AI Chat** - Interactive chat powered by Google Gemini API
- **Blog** - MDX-based blog posts with math support (KaTeX)
- **Responsive Design** - Built with Tailwind CSS

## Production

The live site is at **https://danielfridljand.de/** and is deployed with Coolify on Hetzner (Docker). See [DEPLOYMENT.md](DEPLOYMENT.md) for setup and env vars.

## Running Tests

Tests require the Astro dev server to be running first.

1. Start the dev server (in a separate terminal):
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

Additional test options:
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:headed` - Run tests in headed mode
- `npm run test:production` - Run tests against production site

## Mobile Testing

The easiest way to test how the website looks on mobile devices is using browser DevTools. For automated testing, Playwright mobile device emulation is also available.

### Browser DevTools (Easiest Method)

**Chrome/Edge:**
1. Open the site in Chrome/Edge
2. Press `F12` (or `Cmd+Option+I` on Mac) to open DevTools
3. Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) to toggle device toolbar
4. Select a device preset from the dropdown (iPhone, iPad, Pixel, etc.)
5. Refresh the page to see the mobile view

## Resume PDF

The resume PDF at `public/uploads/resume.pdf` is synced from the [CV_management](https://github.com/FridljDa/CV_management) repository. That repo owns CV source and rendering; it pushes the rendered PDF to this site via PR.

