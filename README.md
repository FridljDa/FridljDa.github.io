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

