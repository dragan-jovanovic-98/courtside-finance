import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Building,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import { DeleteContactButton } from "./delete-button";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  pending: "outline",
  failed: "destructive",
  voicemail: "secondary",
  no_answer: "outline",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (!contact) notFound();

  // Get call history for this contact
  const { data: calls } = await supabase
    .from("calls")
    .select("id, direction, status, duration_seconds, summary, started_at, voice_agents(name)")
    .eq("contact_id", id)
    .order("started_at", { ascending: false, nullsFirst: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/leads">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {contact.first_name} {contact.last_name ?? ""}
          </h1>
          {contact.company && (
            <p className="text-sm text-muted-foreground">{contact.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/leads/${id}/edit`}>
              <Edit className="size-4" />
              Edit
            </Link>
          </Button>
          <DeleteContactButton id={id} name={`${contact.first_name} ${contact.last_name ?? ""}`.trim()} />
        </div>
      </div>

      {/* Contact info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contact.phone && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-sm">{contact.phone}</span>
            </CardContent>
          </Card>
        )}
        {contact.email && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm">{contact.email}</span>
            </CardContent>
          </Card>
        )}
        {contact.company && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Building className="size-4 text-muted-foreground" />
              <span className="text-sm">{contact.company}</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Notes */}
      {contact.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Call history */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Call History</h2>
        {!calls || calls.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No calls with this contact yet.
          </p>
        ) : (
          <div className="space-y-2">
            {calls.map((call) => {
              const agent = call.voice_agents as unknown as { name: string } | null;
              return (
                <Link
                  key={call.id}
                  href={`/calls/${call.id}`}
                  className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {call.direction === "inbound" ? (
                      <PhoneIncoming className="size-4 text-blue-500" />
                    ) : (
                      <PhoneOutgoing className="size-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {agent?.name ?? "Unknown agent"}
                      </p>
                      {call.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                          {call.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {call.duration_seconds != null && call.duration_seconds > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(call.duration_seconds)}
                      </span>
                    )}
                    <Badge variant={statusVariant[call.status] ?? "outline"}>
                      {call.status.replace("_", " ")}
                    </Badge>
                    {call.started_at && (
                      <span className="text-xs text-muted-foreground w-32 text-right">
                        {formatDate(call.started_at)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
