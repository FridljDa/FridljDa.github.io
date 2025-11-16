# Deployment Guide

## Render Deployment

### Initial Setup

1. **Deploy using render.yaml blueprint:**
   - Connect your GitHub repository to Render
   - Use the `render.yaml` file to deploy all services at once
   - Or deploy services individually through the Render dashboard

### Environment Variables

**Important:** For Render deployment, set environment variables in the Render dashboard, NOT in a `.env` file. The `.env` file is only for local development (see README.md).

#### Astro Site Environment Variables

Set these in the Render dashboard for the `astro-site` service:

- `PUBLIC_LANGFLOW_URL` - The public URL of your deployed Langflow service (e.g., `https://langflow-xxxxx.onrender.com`)
- `PUBLIC_LANGFLOW_FLOW_ID` - The Flow ID from Langflow service logs (see below)

#### Langflow Service Environment Variables

Set these in the Render dashboard for the `langflow` service:

- `GOOGLE_AI_STUDIO_API_KEY` - Your Google AI Studio API key
- `ASTRA_DB_API_KEY` - Your Astra DB API key (if using)
- `LANGFLOW_SKIP_AUTH_AUTO_LOGIN` - Set to `"false"` for production

Note: The `LANGFLOW_DATABASE_URL` is automatically set by Render when you link the Postgres database.

### Post-Deployment Steps

1. **Get the Langflow service URL:**
   - After deployment, get the public URL from the Langflow service dashboard
   - Example: `https://langflow-xxxxx.onrender.com`

2. **Get the Flow ID:**
   - Check the Langflow service logs for: `"Flow 'Document Q&A' imported successfully with ID: ..."`
   - Copy the Flow ID from the logs
   - The flow is automatically imported on container startup (idempotent)

3. **Configure Astro site:**
   - Set `PUBLIC_LANGFLOW_URL` in the `astro-site` service environment variables to the Langflow service URL
   - Set `PUBLIC_LANGFLOW_FLOW_ID` in the `astro-site` service environment variables to the Flow ID from step 2
   - Redeploy the Astro site to pick up the new environment variables

