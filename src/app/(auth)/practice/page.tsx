"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionList } from "@/components/practice/session-list";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PracticePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-700" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-heading text-text-primary">
          Practice Journal
        </h1>
        <Button asChild>
          <Link href="/practice/new">
            <Plus className="h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>

      <SessionList userId={user.uid} />
    </main>
  );
}
