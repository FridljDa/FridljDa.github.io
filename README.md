# Personal Website

Astro-based personal website with AI chat functionality powered by Google Gemini API.

## Prerequisites

- Node.js (v18 or higher)

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

## CV Management

The CV is managed through `src/data/cv.yaml` and automatically processed via GitHub Actions:

### Automated Workflow

When `src/data/cv.yaml` is pushed to the `master` branch, a GitHub Actions workflow (`.github/workflows/update-cv.yaml`) automatically:

1. **Generates PDF**: Uses RenderCV to generate a PDF from the YAML file
   ```bash
   rendercv render src/data/cv.yaml
   ```

2. **Generates Markdown**: Converts the YAML to Markdown format for use in the chat API
   ```bash
   yaml-to-markdown -o src/data/cv.md -y src/data/cv.yaml
   ```

3. **Updates Files**: 
   - Copies the generated PDF to `public/uploads/resume.pdf`
   - Updates `src/data/cv.md` (used by the chat API at `src/pages/api/chat.ts`)

4. **Commits Changes**: Automatically commits and pushes the updated PDF and Markdown files

### Manual Workflow

You can also run the CV generation manually:
```bash
pip install "rendercv[full]" yaml-to-markdown
rendercv render src/data/cv.yaml
yaml-to-markdown -o src/data/cv.md -y src/data/cv.yaml
```

The generated PDF will be in `rendercv_output/` directory.

