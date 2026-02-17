import { getAuthContext } from "@/lib/supabase/get-org-id";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { DateFilter } from "./date-filter";
import { DashboardClient, type DashboardStats } from "./dashboard-client";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDateRangeStart(range: string | null): Date | null {
  if (!range || range === "all") return null;
  const now = new Date();
  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const { supabase, organizationId, userId } = await getAuthContext();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? null;

  const rangeStart = getDateRangeStart(range ?? null);

  // ─── Fetch calls ───────────────────────────────────────────────────────────
  let callsQuery = supabase
    .from("calls")
    .select("id, status, duration_seconds, started_at, outcome")
    .eq("organization_id", organizationId);
  if (rangeStart) {
    callsQuery = callsQuery.gte("started_at", rangeStart.toISOString());
  }
  const { data: allCalls } = await callsQuery;

  const calls = allCalls ?? [];
  const totalCalls = calls.length;
  const callsAnswered = calls.filter((c) => c.status === "completed").length;
  const totalSeconds = calls.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // ─── Fetch ALL contacts (expanded query) ───────────────────────────────────
  let contactsQuery = supabase
    .from("contacts")
    .select("id, status, outcome, call_attempts, calls_connected, sms_sent")
    .eq("organization_id", organizationId);
  if (rangeStart) {
    contactsQuery = contactsQuery.gte("updated_at", rangeStart.toISOString());
  }
  const { data: allContacts } = await contactsQuery;

  const contacts = allContacts ?? [];
  const totalLeads = contacts.length;

  // Status counts
  const statusCounts = { new: 0, active: 0, done: 0 };
  for (const c of contacts) {
    const s = c.status as string | null;
    if (s === "new") statusCounts.new++;
    else if (s === "active") statusCounts.active++;
    else if (s === "done") statusCounts.done++;
  }

  // Outcome counts
  const outcomeCounts: Record<string, number> = {
    interested: 0,
    booked: 0,
    unreachable: 0,
    not_interested: 0,
    wrong_number: 0,
    dnc: 0,
    unqualified: 0,
  };
  for (const c of contacts) {
    const o = c.outcome as string | null;
    if (o && o in outcomeCounts) {
      outcomeCounts[o]++;
    }
  }

  // Activity aggregates
  const totalAttempts = contacts.reduce((sum, c) => sum + ((c.call_attempts as number) ?? 0), 0);
  const callsConnected = contacts.reduce((sum, c) => sum + ((c.calls_connected as number) ?? 0), 0);
  const contactRate = totalAttempts > 0 ? (callsConnected / totalAttempts) * 100 : 0;
  const smsSent = contacts.reduce((sum, c) => sum + ((c.sms_sent as number) ?? 0), 0);

  // Engaged metrics
  const engagedCount = outcomeCounts.interested + outcomeCounts.booked;
  const engagedLeadRate = totalLeads > 0 ? (engagedCount / totalLeads) * 100 : 0;

  const stats: DashboardStats = {
    totalLeads,
    engagedCount,
    engagedLeadRate,
    interestedLeads: outcomeCounts.interested,
    bookedLeads: outcomeCounts.booked,
    statusCounts,
    outcomeCounts,
    totalAttempts,
    callsConnected,
    contactRate,
    smsSent,
    totalCalls,
    callsAnswered,
    totalMinutes,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Greeting + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in-up">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight lg:text-3xl">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your voice agents today.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="border-border/60 hover:border-emerald/40 hover:text-emerald">
          <Link href="/campaigns">
            <Megaphone className="size-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Date Filter */}
      <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <DateFilter />
      </div>

      {/* Animated Stats Panels */}
      <DashboardClient stats={stats} />
    </div>
  );
}
