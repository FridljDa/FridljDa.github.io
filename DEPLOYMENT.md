# Deployment Guide

## Render Deployment

### Initial Setup

1. **Deploy using render.yaml blueprint:**
   - Connect your GitHub repository to Render
   - Use the `render.yaml` file to deploy the service
   - Or deploy the service individually through the Render dashboard

### Environment Variables

**Important:** For Render deployment, set environment variables in the Render dashboard, NOT in a `.env` file. The `.env` file is only for local development (see README.md).

#### Required Environment Variables

Set these in the Render dashboard for your web service:

- `GEMINI_API_KEY` - Your Google Gemini API key (required for chat functionality)
  - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - This key is used server-side and should be kept secure

- `PUBLIC_SECRET_PASSWORD` - Secret password for the prompt injection hackathon challenge
  - This is used in the blog post and should be kept secure
  - REQUIRED: Must be set in both local development and production
  - Tests use a fallback password (HackathonWinner2026!) when not set

#### Optional Environment Variables

- `NODE_VERSION` - Node.js version (defaults to 20.11.0 as specified in render.yaml)
- `PORT` - Port number (defaults to 10000, automatically set by Render)

### Health Check Configuration

The service uses `/api/health` as the health check endpoint (configured in `render.yaml`). 

**If the health check path needs to be updated manually:**
1. Go to the Render Dashboard: https://dashboard.render.com
2. Navigate to your web service (`cv-chat-app`)
3. Click on the "Settings" tab
4. Scroll to the "Health Check Path" section
5. Update the path from `/` to `/api/health`
6. Save the changes

**Verify the health endpoint:**
- The endpoint should be accessible at: `https://cv-chat-app.onrender.com/api/health`
- It should return: `{"status":"ok"}` with HTTP 200 status

### Post-Deployment

1. **Verify deployment:**
   - Check that the service is running and accessible
   - The health check endpoint (`/api/health`) should return 200 OK with `{"status":"ok"}`

2. **Test chat functionality:**
   - Navigate to your deployed site
   - Open the chat interface
   - Verify that chat requests are working correctly

3. **Monitor logs:**
   - Check Render service logs for any errors
   - Ensure `GEMINI_API_KEY` is properly set (you should see "Key found" in logs, not "Key missing")

