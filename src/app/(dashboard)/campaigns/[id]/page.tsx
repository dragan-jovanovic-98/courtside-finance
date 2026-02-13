import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Bot,
  Calendar,
  Clock,
  Globe,
  Hash,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { CampaignActions } from "./campaign-actions";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  scheduled: "secondary",
  in_progress: "default",
  paused: "secondary",
  completed: "default",
};

const contactStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  calling: "secondary",
  completed: "default",
  failed: "destructive",
  skipped: "outline",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, voice_agents(name)")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: campaignContacts } = await supabase
    .from("campaign_contacts")
    .select("id, call_status, contact_id, call_id, contacts(first_name, last_name, phone)")
    .eq("campaign_id", id);

  const agent = campaign.voice_agents as unknown as { name: string } | null;
  const progress =
    campaign.total_contacts > 0
      ? Math.round((campaign.calls_completed / campaign.total_contacts) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/campaigns">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <Badge variant={statusVariant[campaign.status] ?? "outline"}>
              {campaign.status.replace("_", " ")}
            </Badge>
          </div>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          )}
        </div>
        <CampaignActions id={campaign.id} status={campaign.status} />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Bot className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Agent</p>
              <p className="text-sm font-medium">{agent?.name ?? "None"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Users className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Contacts</p>
              <p className="text-sm font-medium">{campaign.total_contacts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Hash className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-sm font-medium">{campaign.calls_completed} / {campaign.total_contacts} ({progress}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Calendar className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {campaign.completed_at ? "Completed" : campaign.started_at ? "Started" : campaign.scheduled_at ? "Scheduled" : "Created"}
              </p>
              <p className="text-sm font-medium">
                {formatDate(campaign.completed_at ?? campaign.started_at ?? campaign.scheduled_at ?? campaign.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution settings cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Call Window</p>
              <p className="text-sm font-medium">
                {campaign.call_window_start && campaign.call_window_end
                  ? `${campaign.call_window_start.slice(0, 5)} – ${campaign.call_window_end.slice(0, 5)}`
                  : "No restriction"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Globe className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Timezone</p>
              <p className="text-sm font-medium">{campaign.timezone ?? "America/New_York"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Target className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Daily Cap</p>
              <p className="text-sm font-medium">{campaign.daily_cap ?? "Unlimited"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Zap className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Concurrent Limit</p>
              <p className="text-sm font-medium">{campaign.max_concurrent_calls ?? 5}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Separator />

      {/* Contact list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Contacts</h2>
        {!campaignContacts || campaignContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No contacts in this campaign.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Call Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignContacts.map((cc) => {
                  const contact = cc.contacts as unknown as {
                    first_name: string;
                    last_name: string | null;
                    phone: string | null;
                  } | null;
                  return (
                    <TableRow key={cc.id}>
                      <TableCell className="font-medium">
                        {contact ? (
                          <Link href={`/leads/${cc.contact_id}`} className="hover:underline">
                            {contact.first_name} {contact.last_name ?? ""}
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{contact?.phone ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={contactStatusVariant[cc.call_status] ?? "outline"}>
                          {cc.call_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
