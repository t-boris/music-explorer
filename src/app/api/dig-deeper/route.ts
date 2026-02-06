import { NextRequest, NextResponse } from "next/server";
import {
  streamDigDeeperExplanation,
  type DigDeeperRequest,
} from "@/lib/dig-deeper-service";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Clean up expired entries
  for (const [k, v] of rateLimitMap) {
    if (v.resetAt <= now) {
      rateLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

function validateRequest(
  body: unknown
): { valid: true; data: DigDeeperRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (!b.term && !b.selectedText) {
    return {
      valid: false,
      error: "Either 'term' or 'selectedText' must be provided",
    };
  }

  if (b.term && typeof b.term !== "string") {
    return { valid: false, error: "'term' must be a string" };
  }

  if (b.selectedText && typeof b.selectedText !== "string") {
    return { valid: false, error: "'selectedText' must be a string" };
  }

  if (!b.lessonTitle || typeof b.lessonTitle !== "string") {
    return { valid: false, error: "'lessonTitle' is required and must be a string" };
  }

  if (!b.levelTitle || typeof b.levelTitle !== "string") {
    return { valid: false, error: "'levelTitle' is required and must be a string" };
  }

  if (typeof b.levelOrder !== "number" || b.levelOrder < 0) {
    return {
      valid: false,
      error: "'levelOrder' is required and must be a non-negative number",
    };
  }

  return {
    valid: true,
    data: {
      term: b.term as string | undefined,
      selectedText: b.selectedText as string | undefined,
      lessonTitle: b.lessonTitle as string,
      levelTitle: b.levelTitle as string,
      levelOrder: b.levelOrder as number,
    },
  };
}

export async function POST(request: NextRequest) {
  // Check API key first
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const rateLimitResult = checkRateLimit(rateLimitKey);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.retryAfter) },
      }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const validation = validateRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Stream the response
  try {
    const stream = streamDigDeeperExplanation(validation.data);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = stream.on("text", (text) => {
            controller.enqueue(new TextEncoder().encode(text));
          });

          await messageStream.finalMessage();
          controller.close();
        } catch {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "AI service temporarily unavailable" },
      { status: 502 }
    );
  }
}
