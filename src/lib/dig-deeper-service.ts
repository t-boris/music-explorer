import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export interface DigDeeperRequest {
  term?: string;
  selectedText?: string;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

function buildSystemPrompt(request: DigDeeperRequest): string {
  const depthDescriptor =
    request.levelOrder === 0
      ? "beginner-friendly, using simple language and everyday analogies"
      : request.levelOrder <= 2
        ? "intermediate, assuming basic music theory knowledge"
        : "advanced, using precise technical terminology";

  return `You are a music theory tutor helping an electric guitar student understand concepts from their current lesson.

Current lesson: "${request.lessonTitle}" (part of "${request.levelTitle}")
Explanation depth: ${depthDescriptor}

Guidelines:
- Keep responses concise: 2-4 short paragraphs
- Use musical examples and relate concepts to guitar where possible
- Use markdown formatting: **bold** for key terms, \`backticks\` for frequencies and math
- Be encouraging and connect theory to practical playing`;
}

function buildUserPrompt(request: DigDeeperRequest): string {
  if (request.term) {
    return `Explain the concept of "${request.term}" in the context of ${request.lessonTitle}. What does it mean, why does it matter, and how does it connect to playing guitar?`;
  }

  return `The student is reading about ${request.lessonTitle} and wants to understand this passage better: "${request.selectedText}". Explain what this means in simpler terms, why it's important, and how it connects to the bigger picture.`;
}

export function streamDigDeeperExplanation(request: DigDeeperRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  return client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: buildSystemPrompt(request),
    messages: [
      {
        role: "user",
        content: buildUserPrompt(request),
      },
    ],
  });
}
