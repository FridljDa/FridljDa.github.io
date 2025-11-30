// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Import the CV content as a raw string at build time
import cvText from '../../data/cv.md?raw';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Validate and Parse Request Body
    if (request.headers.get('Content-Type') !== 'application/json') {
      return new Response(JSON.stringify({ error: 'Invalid Content-Type' }), { status: 400 });
    }
    const body = await request.json();
    const { messages } = body;
    // Expecting structure: [{ role: 'user'|'ai', content: string }]

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid message format' }), { status: 400 });
    }

    // 2. Retrieve API Key Securely
    // This key is injected by Render at runtime or from .env file in development.
    const apiKey = import.meta.env.GEMINI_API_KEY;
    console.log('API Key check:', apiKey ? `Key found (length: ${apiKey.length})` : 'Key missing');
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing. Available env vars:', Object.keys(import.meta.env).filter(k => !k.startsWith('PUBLIC_')));
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
        message: 'GEMINI_API_KEY environment variable is not set. Please check your .env file.'
      }), { status: 500 });
    }

    // 3. Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(apiKey);
    // Model names as of November 2025: gemini-2.5-flash, gemini-2.5-pro, gemini-3-pro
    // Using gemini-2.5-flash for low latency and efficiency on free tiers
    // Note: gemini-1.5-flash and gemini-1.5-pro are deprecated
    const modelName = 'gemini-2.5-flash'; // Fastest model. Alternatives: 'gemini-2.5-pro', 'gemini-3-pro'
    const model = genAI.getGenerativeModel({ model: modelName });

    // 4. Construct System Prompt and History
    // We define the persona and inject the CV context.
    const systemInstruction = `
      You are a professional AI assistant representing the owner of the following CV. 
      Your goal is to answer questions about the candidate's experience, skills, and background based *strictly* on the provided text.
        
      tone: Professional, concise, yet approachable.
      rules:  
      - If the answer is not in the CV, explicitly state: "I don't see that information in the CV."
      - Do not hallucinate or invent experiences.
        
      CV DATA:  
      ${cvText}
    `;

    // Map frontend message format to Gemini's expected format
    // Gemini uses 'user' and 'model' roles.
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start the chat session
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }] // Seed the context as the first user message
        },
        {
          role: 'model',
          parts: [{ text: "I have reviewed the CV and am ready to answer questions." }]
        },
        ...history
      ],
    });

    const lastUserMessage = messages[messages.length - 1].content;

    // 5. Generate Streaming Response
    const result = await chat.sendMessageStream(lastUserMessage);

    // 6. Create ReadableStream for HTTP Response
    // This allows the browser to receive data chunks as they arrive.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          console.error('Stream Error:', err);
          controller.error(err);
        }
      },
    });

    // 7. Return Response with Correct Headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked', // Indicates streaming
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Chat Endpoint Critical Failure:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }), { status: 500 });
  }
};

