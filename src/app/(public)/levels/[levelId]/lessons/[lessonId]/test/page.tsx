"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  BookOpen,
  Headphones,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TheoryTest } from "@/components/test/theory-test";
import { EarTraining } from "@/components/test/ear-training";
import type { TestType } from "@/hooks/use-test";

export const dynamic = "force-dynamic";

type TabType = "theory" | "ear";

const THEORY_TYPES: { value: TestType; label: string }[] = [
  { value: "intervals", label: "Intervals" },
  { value: "fretboard", label: "Fretboard" },
  { value: "scales", label: "Scales" },
  { value: "chords", label: "Chords" },
];

export default function TestPage() {
  const params = useParams<{ levelId: string; lessonId: string }>();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("theory");
  const [theoryType, setTheoryType] = useState<TestType>("intervals");
  const [testKey, setTestKey] = useState(0); // force remount on type change

  const levelId = params.levelId;
  const lessonId = params.lessonId;

  const handleTheoryTypeChange = (type: TestType) => {
    setTheoryType(type);
    setTestKey((k) => k + 1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setTestKey((k) => k + 1);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-text-muted">
        <Link
          href="/levels"
          className="transition-colors hover:text-accent-400"
        >
          Levels
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/levels/${levelId}`}
          className="transition-colors hover:text-accent-400"
        >
          Level {levelId.replace("level-", "")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/levels/${levelId}/lessons/${lessonId}`}
          className="transition-colors hover:text-accent-400"
        >
          Lesson
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-secondary">Test</span>
      </nav>

      {/* Page header */}
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          Knowledge Test
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Test your understanding with theory questions and ear training exercises.
        </p>
      </header>

      {/* Auth notice */}
      {!loading && !user && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-surface-600 bg-surface-800 px-4 py-3">
          <LogIn className="h-5 w-5 text-accent-400" />
          <p className="text-sm text-text-secondary">
            You can take this test as a preview.{" "}
            <Link href="/auth/signin" className="text-accent-400 hover:text-accent-300">
              Sign in
            </Link>{" "}
            to save your scores and track progress.
          </p>
        </div>
      )}

      {/* Tab selector */}
      <div className="mb-6 flex rounded-lg bg-surface-800 p-1">
        <button
          onClick={() => handleTabChange("theory")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "theory"
              ? "bg-accent-500 text-surface-900"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Theory Test
        </button>
        <button
          onClick={() => handleTabChange("ear")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "ear"
              ? "bg-accent-500 text-surface-900"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Headphones className="h-4 w-4" />
          Ear Training
        </button>
      </div>

      {/* Theory type sub-selector */}
      {activeTab === "theory" && (
        <div className="mb-6 flex flex-wrap gap-2">
          {THEORY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTheoryTypeChange(type.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                theoryType === type.value
                  ? "bg-accent-500/20 text-accent-400 ring-1 ring-accent-500/50"
                  : "bg-surface-700 text-text-muted hover:text-text-secondary"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}

      {/* Test content */}
      {activeTab === "theory" ? (
        <TheoryTest
          key={`theory-${testKey}`}
          testType={theoryType}
          userId={user?.uid}
          levelId={levelId}
          lessonId={lessonId}
        />
      ) : (
        <EarTraining
          key={`ear-${testKey}`}
          userId={user?.uid}
          levelId={levelId}
          lessonId={lessonId}
        />
      )}
    </main>
  );
}
