import Link from "next/link";
import { Music, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="flex max-w-2xl flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/20">
          <Music className="h-10 w-10 text-surface-900" />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          Music{" "}
          <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
            Explorer
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-6 max-w-lg text-lg text-text-secondary">
          A structured, evidence-based learning companion. Track your practice,
          record your progress, and master music theory from the ground up.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-accent-500 text-surface-900 hover:bg-accent-400"
          >
            <Link href="/levels">
              Start Learning
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Subtle footer accent */}
      <div className="mt-24 text-sm text-text-muted">
        Practice with purpose. Progress with proof.
      </div>
    </main>
  );
}
