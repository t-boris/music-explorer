import { getContentSummary } from "@/lib/content";
import { ProgressClient } from "@/components/progress/progress-client";

export default function ProgressPage() {
  const contentSummary = getContentSummary();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <ProgressClient contentSummary={contentSummary} />
    </main>
  );
}
