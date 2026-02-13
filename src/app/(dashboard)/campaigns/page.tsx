import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus } from "lucide-react";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  scheduled: "secondary",
  in_progress: "default",
  paused: "secondary",
  completed: "default",
};

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, status, total_contacts, calls_completed, scheduled_at, started_at, completed_at, created_at, voice_agents(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <Button asChild size="sm">
          <Link href="/campaigns/new">
            <Plus className="size-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Megaphone className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No campaigns yet. Create your first outbound campaign to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const agent = campaign.voice_agents as unknown as { name: string } | null;
            const progress =
              campaign.total_contacts > 0
                ? Math.round((campaign.calls_completed / campaign.total_contacts) * 100)
                : 0;

            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="hover:bg-muted/50 transition-colors h-full">
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{campaign.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {agent?.name ?? "No agent assigned"}
                      </p>
                    </div>
                    <Badge variant={statusVariant[campaign.status] ?? "outline"}>
                      {campaign.status.replace("_", " ")}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{campaign.calls_completed} / {campaign.total_contacts} calls</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {/* Dates */}
                    <div className="text-xs text-muted-foreground">
                      {campaign.scheduled_at && (
                        <span>Scheduled: {formatDate(campaign.scheduled_at)}</span>
                      )}
                      {campaign.started_at && (
                        <span>Started: {formatDate(campaign.started_at)}</span>
                      )}
                      {campaign.completed_at && (
                        <span>Completed: {formatDate(campaign.completed_at)}</span>
                      )}
                      {!campaign.scheduled_at && !campaign.started_at && (
                        <span>Created: {formatDate(campaign.created_at)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
