# Deployment Guide

## Environment Variables

### Astro Site Environment Variables

Create a `.env` file in the project root (or set in Render dashboard) with:

```env
# Langflow URL - Public URL of your deployed Langflow instance
# For local development, use: http://localhost:7860
# For production (Render), use: https://your-langflow-service.onrender.com
PUBLIC_LANGFLOW_URL=http://localhost:7860

# Flow ID - Automatically set by Langflow entrypoint script
# For local development, check Langflow container logs or /app/content/flow-id.txt
# For production, check Langflow service logs after first deployment
# The entrypoint script will import the "Document Q&A" flow and log its ID
PUBLIC_LANGFLOW_FLOW_ID=4f2f5788-d593-4480-b869-3bd78f25c236
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
   - Check the Langflow service logs for the flow ID (look for "Flow 'Document Q&A' imported successfully with ID: ...")
   - Set `PUBLIC_LANGFLOW_FLOW_ID` in your Astro static site environment variables with the flow ID from the logs
   - Redeploy the Astro site to pick up the new environment variables

3. **Flow Import:**
   - The "Document Q&A" flow is automatically imported on Langflow container startup
   - The entrypoint script checks if the flow exists first (idempotent)
   - The flow ID is written to `/app/content/flow-id.txt` in the Langflow container
   - Check container logs or the flow-id.txt file to get the flow ID for the chat widget

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

