import "server-only";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3-flash-preview";

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

// ─── Exercise Explanation Support ───

export interface ExerciseExplanationRequest {
  exerciseTitle: string;
  exerciseType: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

function buildExerciseSystemPrompt(request: ExerciseExplanationRequest): string {
  const depthDescriptor =
    request.levelOrder === 0
      ? "beginner-friendly, using simple language and everyday analogies"
      : request.levelOrder <= 2
        ? "intermediate, assuming basic music theory knowledge"
        : "advanced, using precise technical terminology";

  return `You are a music theory tutor explaining an exercise result to an electric guitar student. The student just completed an exercise in their lesson "${request.lessonTitle}" (part of "${request.levelTitle}").

Explanation depth: ${depthDescriptor}

Guidelines:
- Be encouraging, concise, and connect the explanation to practical guitar playing
- Use markdown formatting: **bold** for key terms, \`backticks\` for frequencies and math
- Keep it brief and focused on helping them understand the concept`;
}

function buildExerciseUserPrompt(request: ExerciseExplanationRequest): string {
  if (request.isCorrect) {
    return `The student correctly answered "${request.question}" with "${request.studentAnswer}". Briefly explain why this is correct and what concept it demonstrates. Keep it to 1-2 short paragraphs.`;
  }

  return `The student answered "${request.question}" with "${request.studentAnswer}", but the correct answer is "${request.correctAnswer}". Explain why the correct answer is right, what the student might have confused, and give a tip to remember it next time. Keep it to 2-3 short paragraphs.`;
}

// ─── Shared Client ───

function getClient(): GoogleGenAI {
  const apiKey = process.env.GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GENAI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

// ─── Streaming Functions ───

export async function* streamExerciseExplanation(
  request: ExerciseExplanationRequest
): AsyncGenerator<string> {
  const client = getClient();

  const response = await client.models.generateContentStream({
    model: MODEL,
    contents: buildExerciseUserPrompt(request),
    config: {
      systemInstruction: buildExerciseSystemPrompt(request),
      maxOutputTokens: 512,
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export async function* streamDigDeeperExplanation(
  request: DigDeeperRequest
): AsyncGenerator<string> {
  const client = getClient();

  const response = await client.models.generateContentStream({
    model: MODEL,
    contents: buildUserPrompt(request),
    config: {
      systemInstruction: buildSystemPrompt(request),
      maxOutputTokens: 1024,
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
