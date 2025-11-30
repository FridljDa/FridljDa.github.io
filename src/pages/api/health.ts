// src/pages/api/health.ts
import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GET: APIRoute = async () => {
  try {
    // 1. Check if GEMINI_API_KEY is configured
    const apiKey = import.meta.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          error: 'GEMINI_API_KEY environment variable is not set',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    // 2. Verify Gemini client can be initialized (without making API calls)
    // This ensures the API key format is valid and the client library is working
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Initialize a model instance to verify the client setup
      // We don't call any methods that would make API requests
      genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch (error) {
      // If client initialization fails, the service is unhealthy
      // Log full error details for diagnostics
      console.error("Gemini client initialization error:", error);
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          error: 'Failed to initialize Gemini client',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    // 3. Return healthy status
    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
    // Log full error details for diagnostics
    console.error("Health check error:", error);
      }
    );
  } catch (error) {
    // Catch any unexpected errors
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: 'Health check failed',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
};

