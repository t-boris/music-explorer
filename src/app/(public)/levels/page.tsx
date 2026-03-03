import { getLevels, getLessons, getLevelsWithContent } from "@/lib/content";
import { LevelsWithProgress } from "@/components/content/levels-with-progress";

export const metadata = {
  title: "Learning Roadmap | Music Explorer",
  description:
    "Browse the 13-level learning roadmap from the physics of sound to musical mastery.",
};

export default function LevelsPage() {
  const levels = getLevels();
  const activeLevelIds = getLevelsWithContent();

  // Pre-compute lesson counts server-side so the client component doesn't need content.ts
  const lessonCounts: Record<string, number> = {};
  for (const id of activeLevelIds) {
    lessonCounts[id] = getLessons(id).length;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Learning Roadmap
        </h1>
        <p className="mt-2 text-text-secondary">
          13 levels from the physics of sound to musical mastery. Work through
          each level at your own pace.
        </p>
      </div>

      <LevelsWithProgress
        levels={levels}
        activeLevelIds={Array.from(activeLevelIds)}
        lessonCounts={lessonCounts}
      />
    </main>
  );
}
