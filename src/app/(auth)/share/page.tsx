"use client";

import Link from "next/link";
import { Loader2, UserMinus, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useConnections } from "@/hooks/use-connections";
import { ShareSettings } from "@/components/community/share-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SharePage() {
  const { user } = useAuth();
  const {
    inviteLink,
    connectionsToMe,
    myConnections,
    loading,
    generateInvite,
    removeConnection,
  } = useConnections(user?.uid);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        <p className="mt-3 text-sm text-text-muted">Loading share settings...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Share Settings
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your invite link and connections.
        </p>
      </header>

      <div className="space-y-6">
        {/* Invite Link Card */}
        <ShareSettings
          inviteLink={inviteLink}
          loading={false}
          onGenerate={generateInvite}
        />

        {/* People Who Can See My Dashboard */}
        <Card className="border-border bg-surface-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Users className="h-5 w-5 text-accent-400" />
              People who can see my dashboard
            </CardTitle>
            <CardDescription className="text-text-muted">
              These people accepted your invite and can view your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectionsToMe.length === 0 ? (
              <p className="text-sm text-text-muted">
                No one has connected yet. Share your invite link to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {connectionsToMe.map((conn) => (
                  <li
                    key={conn.id}
                    className="flex items-center justify-between rounded-lg bg-surface-900 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {conn.toPhotoURL ? (
                        <img
                          src={conn.toPhotoURL}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-700 text-sm text-text-muted">
                          {conn.toDisplayName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-primary">
                        {conn.toDisplayName || "User"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeConnection(conn.id)}
                      className="text-text-muted hover:text-red-400"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span className="sr-only">Remove connection</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Dashboards I Can View */}
        <Card className="border-border bg-surface-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Users className="h-5 w-5 text-accent-400" />
              Dashboards I can view
            </CardTitle>
            <CardDescription className="text-text-muted">
              People whose invite links you accepted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myConnections.length === 0 ? (
              <p className="text-sm text-text-muted">
                You haven&apos;t connected with anyone yet. Accept an invite link to view
                someone&apos;s dashboard.
              </p>
            ) : (
              <ul className="space-y-3">
                {myConnections.map((conn) => (
                  <li
                    key={conn.id}
                    className="flex items-center justify-between rounded-lg bg-surface-900 px-4 py-3"
                  >
                    <Link
                      href={`/community/${conn.fromUserId}`}
                      className="flex items-center gap-3 transition-colors hover:text-accent-400"
                    >
                      {conn.fromPhotoURL ? (
                        <img
                          src={conn.fromPhotoURL}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-700 text-sm text-text-muted">
                          {conn.fromDisplayName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-primary">
                        {conn.fromDisplayName || "User"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
