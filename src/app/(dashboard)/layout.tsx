import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("verification_status")
    .eq("id", profile.organization_id)
    .single();

  const verificationStatus = org?.verification_status ?? "incomplete";

  const fullName = profile?.full_name ?? null;
  const email = profile?.email ?? user.email ?? null;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-border/50 bg-sidebar">
        <Sidebar fullName={fullName} email={email} />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader fullName={fullName} email={email} />
        <main className="flex-1 overflow-y-auto">
          <div className="bg-grid-pattern min-h-full px-4 py-6 lg:px-8 lg:py-8">
            {verificationStatus === "incomplete" && (
              <div className="mx-auto max-w-6xl mb-6 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                <p className="flex-1 text-sm text-amber-500">
                  <span className="font-medium">Business verification required</span>
                  <span className="text-muted-foreground"> — Complete verification to enable campaigns, calling, and SMS.</span>
                </p>
                <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500">
                  <Link href="/settings?tab=verification">Verify now</Link>
                </Button>
              </div>
            )}
            {verificationStatus === "pending_review" && (
              <div className="mx-auto max-w-6xl mb-6 flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3">
                <Clock className="size-4 text-blue-500 shrink-0" />
                <p className="flex-1 text-sm text-muted-foreground">
                  <span className="font-medium text-blue-500">Verification pending</span> — Your business details are being reviewed.
                </p>
              </div>
            )}
            {verificationStatus === "rejected" && (
              <div className="mx-auto max-w-6xl mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertTriangle className="size-4 text-destructive shrink-0" />
                <p className="flex-1 text-sm text-destructive">
                  <span className="font-medium">Verification rejected</span>
                  <span className="text-muted-foreground"> — Please update your details and resubmit.</span>
                </p>
                <Button asChild size="sm" variant="outline" className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Link href="/settings?tab=verification">Update details</Link>
                </Button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
