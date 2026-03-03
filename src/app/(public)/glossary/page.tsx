import { getGlossaryTerms } from "@/lib/glossary";
import { GlossaryClient } from "@/components/glossary/glossary-client";

export const metadata = {
  title: "Glossary | Music Explorer",
  description: "Reference glossary of music theory terms covered in Music Explorer lessons.",
};

export default function GlossaryPage() {
  const terms = getGlossaryTerms();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          Glossary
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {terms.length} music theory terms from your lessons.
        </p>
      </header>
      <GlossaryClient terms={terms} />
    </main>
  );
}
