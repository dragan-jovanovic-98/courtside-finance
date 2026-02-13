import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  PhoneIncoming,
  Clock,
  TrendingUp,
  Plus,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

const statusColors: Record<string, string> = {
  completed: "default",
  in_progress: "secondary",
  pending: "outline",
  failed: "destructive",
  voicemail: "secondary",
  no_answer: "outline",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch all calls for the user
  const { data: allCalls } = await supabase
    .from("calls")
    .select("id, status, duration_seconds, started_at")
    .eq("user_id", user!.id);

  const calls = allCalls ?? [];
  const totalCalls = calls.length;
  const callsToday = calls.filter(
    (c) => c.started_at && new Date(c.started_at) >= todayStart
  ).length;
  const completedCalls = calls.filter((c) => c.status === "completed");
  const avgDuration =
    completedCalls.length > 0
      ? completedCalls.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0) /
        completedCalls.length
      : 0;
  const successRate =
    totalCalls > 0
      ? Math.round((completedCalls.length / totalCalls) * 100)
      : 0;

  // Fetch recent 10 calls with contact and agent info
  const { data: recentCalls } = await supabase
    .from("calls")
    .select(
      "id, direction, status, duration_seconds, started_at, from_number, to_number, contacts(first_name, last_name), voice_agents(name)"
    )
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(10);

  const metrics = [
    {
      label: "Total Calls",
      value: totalCalls,
      icon: Phone,
    },
    {
      label: "Calls Today",
      value: callsToday,
      icon: PhoneIncoming,
    },
    {
      label: "Avg Duration",
      value: avgDuration > 0 ? formatDuration(avgDuration) : "—",
      icon: Clock,
    },
    {
      label: "Success Rate",
      value: totalCalls > 0 ? `${successRate}%` : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/calls">
              <Plus className="size-4" />
              New Call
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/campaigns">
              <Megaphone className="size-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <metric.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Calls</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/calls">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!recentCalls || recentCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Phone className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No calls yet. Your call activity will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCalls.map((call) => {
                const contact = call.contacts as unknown as {
                  first_name: string | null;
                  last_name: string | null;
                } | null;
                const agent = call.voice_agents as unknown as {
                  name: string;
                } | null;
                const contactName = contact
                  ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim()
                  : null;
                const displayName =
                  contactName ||
                  (call.direction === "outbound"
                    ? call.to_number
                    : call.from_number) ||
                  "Unknown";

                return (
                  <div
                    key={call.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent?.name ?? "No agent"} ·{" "}
                        {call.direction === "inbound" ? "Inbound" : "Outbound"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {call.duration_seconds != null && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(call.duration_seconds)}
                        </span>
                      )}
                      <Badge
                        variant={
                          (statusColors[call.status] as
                            | "default"
                            | "secondary"
                            | "outline"
                            | "destructive") ?? "outline"
                        }
                      >
                        {call.status.replace("_", " ")}
                      </Badge>
                      {call.started_at && (
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {formatRelativeTime(call.started_at)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
