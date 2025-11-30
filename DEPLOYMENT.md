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

#### Optional Environment Variables

- `NODE_VERSION` - Node.js version (defaults to 20.11.0 as specified in render.yaml)
- `PORT` - Port number (defaults to 10000, automatically set by Render)

### Post-Deployment

1. **Verify deployment:**
   - Check that the service is running and accessible
   - The health check endpoint (`/`) should return 200 OK

2. **Test chat functionality:**
   - Navigate to your deployed site
   - Open the chat interface
   - Verify that chat requests are working correctly

3. **Monitor logs:**
   - Check Render service logs for any errors
   - Ensure `GEMINI_API_KEY` is properly set (you should see "Key found" in logs, not "Key missing")

