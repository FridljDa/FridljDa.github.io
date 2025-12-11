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
   - Add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

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

The live site is available at: **https://danielfridljand.de/**

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

## CV Management

The CV is managed through `src/data/cv.yaml` and automatically processed via GitHub Actions:

### Automated Workflow

When `src/data/cv.yaml` is pushed to the `master` branch, a GitHub Actions workflow (`.github/workflows/update-cv.yaml`) automatically:

1. **Generates PDF**: Uses RenderCV to generate a PDF from the YAML file
   ```bash
   rendercv render src/data/cv.yaml
   ```

2. **Updates Files**: 
   - Copies the generated PDF to `public/uploads/resume.pdf`

3. **Commits Changes**: Automatically commits and pushes the updated PDF file

### Manual Workflow

You can also run the CV generation manually:
```bash
pip install "rendercv[full]"
rendercv render src/data/cv.yaml
```

The generated PDF will be in `rendercv_output/` directory.

