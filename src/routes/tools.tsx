import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Shell, Splash } from "@/components/shell";
import { useConnect } from "@/lib/connect";

export const Route = createFileRoute("/tools")({ component: ToolsPage });

function ToolsPage() {
  const { ready, session, profile } = useConnect();
  if (!ready) return <Splash />;
  if (!session || !profile) return <Navigate to="/login" />;
  if (profile.membershipStatus !== "active") return <Navigate to="/checkout" />;
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
        <p className="text-[11px] font-medium tracking-[0.18em] text-teal">TOOLS</p>
        <h1 className="mt-1 font-display text-3xl">Tools & Apps</h1>
        <p className="mt-6 text-sm text-muted">No tools listed yet.</p>
      </div>
    </Shell>
  );
}