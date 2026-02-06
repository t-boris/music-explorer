"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Connection } from "@/types/index";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PeopleListProps {
  connections: Connection[];
}

export function PeopleList({ connections }: PeopleListProps) {
  if (connections.length === 0) {
    return (
      <Card className="border-border bg-surface-800">
        <CardContent>
          <p className="text-sm text-text-muted">
            No connections yet. Ask a friend to share their invite link with
            you, or{" "}
            <Link href="/share" className="text-accent-400 hover:underline">
              share yours from Settings
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
      {connections.map((conn) => {
        const name = conn.fromDisplayName;
        const initials = getInitials(name);

        return (
          <Link
            key={conn.id}
            href={`/community/${conn.fromUserId}`}
            className="flex-shrink-0"
          >
            <Card className="w-32 border-border bg-surface-800 transition-colors hover:bg-surface-700 md:w-auto">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                {conn.fromPhotoURL ? (
                  <img
                    src={conn.fromPhotoURL}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-text-primary">
                    {initials}
                  </div>
                )}
                <span className="truncate text-xs font-medium text-text-primary">
                  {name}
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
