"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { acceptInvite } from "@/lib/connection-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type InviteStatus = "processing" | "success" | "error";

export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<InviteStatus>("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    if (!user || !params.code || processedRef.current) return;
    processedRef.current = true;

    async function process() {
      try {
        await acceptInvite(
          params.code,
          user!.uid,
          user!.displayName ?? "User",
          user!.photoURL ?? null
        );
        setStatus("success");

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push("/share");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to process invite."
        );
      }
    }

    process();
  }, [user, params.code, router]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      {status === "processing" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent-400" />
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Processing invite...
          </h1>
          <p className="text-sm text-text-muted">
            Connecting you with the sharer.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-400" />
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Connected!
          </h1>
          <p className="text-sm text-text-muted">
            You can now view their dashboard and progress.
          </p>
          <p className="text-xs text-text-muted">
            Redirecting to share settings in 3 seconds...
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/share">Go to Share Settings</Link>
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-400" />
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Invite Failed
          </h1>
          <p className="text-sm text-red-400">{errorMessage}</p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
