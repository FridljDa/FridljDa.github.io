# Deployment Guide

## Coolify on Hetzner (Docker)

Production runs on a Hetzner server using [Coolify](https://coolify.io/) for build and deploy. You install and manage Coolify on the server; this repo provides a Dockerfile-based app.

### Build and run settings in Coolify

- **Build context**: repository root
- **Dockerfile path**: `./Dockerfile`
- **Port**: app listens on `PORT` (default `4321`). In Coolify, set the container port to `4321` (or set `PORT` to match what Coolify assigns).
- **Health check path**: `/api/health` (returns `{"status":"ok"}` with 200)

### Environment variables

Set these in Coolify for the service (not in `.env` in the repo; `.env` is for local dev only).

**Required:**

- `GEMINI_API_KEY` – Google Gemini API key for chat. Get it from [Google AI Studio](https://aistudio.google.com/app/apikey). Server-side only; keep secret.
- `PUBLIC_SECRET_PASSWORD` – Secret for the prompt-injection hackathon challenge (blog). Required in production and local dev; tests use a fallback when unset.

**Optional:**

- `PORT` – Port the app listens on (default in image: `4321`). Override if Coolify uses a different internal port.

### Domain

Point **https://danielfridljand.de/** to the Coolify-managed app (proxy/ingress in Coolify or your reverse proxy).

### After deploy

1. **Health**: `https://danielfridljand.de/api/health` should return 200 and `{"status":"ok"}`.
2. **Chat**: Open the site, use the chat; confirm requests succeed.
3. **Logs**: In Coolify, check app logs; ensure `GEMINI_API_KEY` is set (e.g. no “Key missing” in logs).
