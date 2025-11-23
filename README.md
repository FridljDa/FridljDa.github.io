# Personal Website

Astro-based personal website with Langflow integration.

## Prerequisites

- Node.js (v18 or higher)
- Docker Desktop or Docker Engine

## Astro Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:4321`.

## Docker Compose (Langflow)

The Langflow workspace is located in `dynamic/langflow-workspace/`.

1. Navigate to the directory:
```bash
cd dynamic/langflow-workspace
```

2. Build and start services:
```bash
docker compose build
docker compose up -d
```

Langflow will be available at `http://localhost:7860`, and Postgres on port `5432`.

To stop services:
```bash
docker compose down
```

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

