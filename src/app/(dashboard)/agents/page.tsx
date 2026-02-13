import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Phone, Hash, Clock } from "lucide-react";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  archived: "outline",
};

export default async function AgentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agents } = await supabase
    .from("voice_agents")
    .select("id, name, description, phone_number, status, retell_agent_id, created_at")
    .eq("user_id", user!.id)
    .order("name");

  // Get call stats per agent
  const { data: callStats } = await supabase
    .from("calls")
    .select("agent_id, started_at")
    .eq("user_id", user!.id);

  // Aggregate stats
  const statsMap = new Map<string, { total: number; lastCall: string | null }>();
  (callStats ?? []).forEach((call) => {
    if (!call.agent_id) return;
    const existing = statsMap.get(call.agent_id) ?? { total: 0, lastCall: null };
    existing.total++;
    if (call.started_at && (!existing.lastCall || call.started_at > existing.lastCall)) {
      existing.lastCall = call.started_at;
    }
    statsMap.set(call.agent_id, existing);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Voice Agents</h1>
        <p className="text-sm text-muted-foreground">
          Agents are managed in Retell and synced here automatically.
        </p>
      </div>

      {!agents || agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bot className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No voice agents yet. Create agents in Retell and they will sync here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const stats = statsMap.get(agent.id) ?? { total: 0, lastCall: null };
            return (
              <Card key={agent.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    {agent.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusVariant[agent.status] ?? "outline"}>
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-3.5 text-muted-foreground" />
                      <span>{agent.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Hash className="size-3.5" />
                      <span>{stats.total} call{stats.total !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      <span>{stats.lastCall ? formatDate(stats.lastCall) : "No calls yet"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
