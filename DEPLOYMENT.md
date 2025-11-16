# Deployment Guide

## Environment Variables

### Astro Site Environment Variables

Create a `.env` file in the project root (or set in Render dashboard) with:

```env
# Langflow URL - Public URL of your deployed Langflow instance
# For local development, use: http://localhost:7860
# For production (Render), use: https://your-langflow-service.onrender.com
PUBLIC_LANGFLOW_URL=http://localhost:7860
```

### Langflow Service Environment Variables

Set these in the Render dashboard for the Langflow service:

- `GOOGLE_AI_STUDIO_API_KEY` - Your Google AI Studio API key
- `ASTRA_DB_API_KEY` - Your Astra DB API key (if using)
- `LANGFLOW_SKIP_AUTH_AUTO_LOGIN` - Set to `"true"` for development, `"false"` for production

Note: The `LANGFLOW_DATABASE_URL` is automatically set by Render when you link the Postgres database.

## Render Deployment

1. **Deploy using render.yaml blueprint:**
   - Connect your GitHub repository to Render
   - Use the `render.yaml` file to deploy all services at once
   - Or deploy services individually through the Render dashboard

2. **After deployment:**
   - Get the public URL of your Langflow service
   - Set `PUBLIC_LANGFLOW_URL` in your Astro static site environment variables to point to the Langflow service URL
   - Redeploy the Astro site to pick up the new environment variable

3. **Flow ID:**
   - The chat widget is configured to use flow ID: `a67ffb73-6ec8-47e5-8644-a86f69eb5b2e`
   - Make sure this flow exists in your Langflow instance

## Local Development

1. Start Langflow locally:
   ```bash
   cd dynamic/langflow-workspace
   docker compose up -d
   ```

2. Start Astro dev server:
   ```bash
   npm run dev
   ```

3. The chat widget will automatically connect to `http://localhost:7860` if `PUBLIC_LANGFLOW_URL` is not set.

