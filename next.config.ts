import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include content/ MDX files in the server output so they're available
  // at runtime in the Cloud Function (Firebase Hosting SSR).
  outputFileTracingIncludes: {
    "/levels/\\[levelId\\]": ["./content/levels/**/*"],
    "/levels/\\[levelId\\]/lessons/\\[lessonId\\]": ["./content/levels/**/*"],
    "/levels/\\[levelId\\]/lessons/\\[lessonId\\]/test": ["./content/levels/**/*"],
    "/songs/\\[songId\\]": ["./content/songs/**/*"],
    "/practice/new": ["./content/levels/**/*"],
    "/practice/\\[sessionId\\]/edit": ["./content/levels/**/*"],
  },
};

export default nextConfig;
