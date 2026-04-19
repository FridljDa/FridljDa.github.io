import type { APIRoute } from 'astro';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { logger } from '../../utils/logger';
// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}
export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('cf-connecting-ip') ??
    'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  let body: { text?: unknown; schema?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { text, schema } = body;
  if (typeof text !== 'string' || !schema || typeof schema !== 'object') {
    return new Response(JSON.stringify({ error: 'Missing text or schema' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const jsonSchema = schema as Record<string, unknown>;
    const properties = (jsonSchema.properties ?? {}) as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function toGeminiSchema(prop: Record<string, unknown>): any {
      if (Array.isArray(prop.anyOf)) {
        const nonNull = (prop.anyOf as Record<string, unknown>[]).find((s) => s.type !== 'null');
        if (nonNull) {
          return { ...toGeminiSchema(nonNull), nullable: true };
        }
        return { type: SchemaType.STRING, nullable: true };
      }
      const base: Record<string, unknown> = {};
      if (prop.description) base.description = prop.description;
      if (Array.isArray(prop.examples)) base.example = (prop.examples as unknown[])[0];
      if (prop.type === 'number') {
        base.type = SchemaType.NUMBER;
        if (prop.minimum !== undefined) base.minimum = prop.minimum;
        if (prop.maximum !== undefined) base.maximum = prop.maximum;
      } else if (Array.isArray(prop.enum)) {
        base.type = SchemaType.STRING;
        base.enum = prop.enum;
      } else {
        base.type = SchemaType.STRING;
        if (prop.format) base.format = prop.format;
        if (prop.pattern) base.pattern = prop.pattern;
      }
      return base;
    }
    const geminiProperties: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(properties)) {
      geminiProperties[key] = toGeminiSchema(val as Record<string, unknown>);
    }
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: geminiProperties as Record<string, { type: SchemaType }>,
          required: (jsonSchema.required ?? []) as string[],
        },
      },
    });
    const prompt = `You are a form-filling assistant. Extract the values from the user's text and map them to the form fields described in the schema. Return ONLY a JSON object matching the schema. If a piece of information is not present in the text, return null for that field.
User text: "${text}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let values: Record<string, unknown>;
    try {
      values = JSON.parse(responseText);
    } catch {
      return new Response(JSON.stringify({ error: 'Model returned invalid JSON' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ values }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('form-fill endpoint error:', error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ error: 'LLM call failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
