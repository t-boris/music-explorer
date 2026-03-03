"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { GlossaryTerm } from "@/lib/glossary";

interface GlossaryClientProps {
  terms: GlossaryTerm[];
}

export function GlossaryClient({ terms }: GlossaryClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return terms;
    const q = search.toLowerCase();
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [terms, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      const group = map.get(letter) ?? [];
      group.push(term);
      map.set(letter, group);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full rounded-lg border border-surface-700 bg-surface-800 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      {/* Term groups */}
      {grouped.length === 0 && (
        <p className="py-8 text-center text-sm text-text-muted">
          No terms match &ldquo;{search}&rdquo;
        </p>
      )}

      {grouped.map(([letter, letterTerms]) => (
        <div key={letter} className="mb-8">
          <h2 className="mb-3 font-heading text-lg font-bold text-accent-400">
            {letter}
          </h2>
          <div className="space-y-3">
            {letterTerms.map((term) => (
              <div
                key={term.id}
                className="rounded-xl border border-surface-700 bg-surface-800 p-4"
              >
                <h3 className="font-heading text-base font-semibold text-text-primary">
                  {term.term}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {term.definition}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/levels/${term.levelId}/lessons/${term.lessonId}`}
                    className="text-xs text-accent-400 transition-colors hover:text-accent-300"
                  >
                    {term.levelTitle} &rarr; {term.lessonTitle}
                  </Link>
                  {term.relatedTerms.length > 0 && (
                    <>
                      <span className="text-xs text-text-muted">|</span>
                      {term.relatedTerms.map((rt) => {
                        const related = terms.find((t) => t.id === rt);
                        if (!related) return null;
                        return (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => setSearch(related.term)}
                            className="rounded-full bg-surface-700 px-2 py-0.5 text-xs text-text-secondary transition-colors hover:bg-surface-600 hover:text-text-primary"
                          >
                            {related.term}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
