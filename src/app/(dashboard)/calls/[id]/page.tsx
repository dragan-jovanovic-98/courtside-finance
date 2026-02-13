import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  User,
  Bot,
  FileText,
  SmilePlus,
} from "lucide-react";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  pending: "outline",
  failed: "destructive",
  voicemail: "secondary",
  no_answer: "outline",
};

const sentimentLabel: Record<string, { text: string; color: string }> = {
  positive: { text: "Positive", color: "text-green-600" },
  neutral: { text: "Neutral", color: "text-yellow-600" },
  negative: { text: "Negative", color: "text-red-600" },
};

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: call } = await supabase
    .from("calls")
    .select(
      "*, contacts(id, first_name, last_name, phone, email, company), voice_agents(id, name, phone_number)"
    )
    .eq("id", id)
    .single();

  if (!call) {
    notFound();
  }

  const contact = call.contacts as unknown as {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    company: string | null;
  } | null;

  const agent = call.voice_agents as unknown as {
    id: string;
    name: string;
    phone_number: string | null;
  } | null;

  const contactName = contact
    ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim()
    : null;

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/calls">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {contactName || call.from_number || call.to_number || "Unknown Call"}
            </h1>
            <Badge variant={statusVariant[call.status] ?? "outline"}>
              {call.status.replace("_", " ")}
            </Badge>
          </div>
          {call.started_at && (
            <p className="text-sm text-muted-foreground">
              {formatDateTime(call.started_at)}
            </p>
          )}
        </div>
      </div>

      {/* Info cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            {call.direction === "inbound" ? (
              <PhoneIncoming className="size-4 text-blue-500" />
            ) : (
              <PhoneOutgoing className="size-4 text-green-500" />
            )}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Direction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">{call.direction}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {call.duration_seconds != null && call.duration_seconds > 0
                ? formatDuration(call.duration_seconds)
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Phone className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="text-muted-foreground">From: </span>
              {call.from_number ?? "—"}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">To: </span>
              {call.to_number ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <SmilePlus className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {call.sentiment ? (
              <p className={`text-lg font-semibold ${sentimentLabel[call.sentiment]?.color ?? ""}`}>
                {sentimentLabel[call.sentiment]?.text ?? call.sentiment}
              </p>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact + Agent info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            {contact ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  <Link href={`/leads`} className="hover:underline">
                    {contactName || "Unknown"}
                  </Link>
                </p>
                {contact.phone && <p className="text-muted-foreground">{contact.phone}</p>}
                {contact.email && <p className="text-muted-foreground">{contact.email}</p>}
                {contact.company && <p className="text-muted-foreground">{contact.company}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked contact</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bot className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Agent</CardTitle>
          </CardHeader>
          <CardContent>
            {agent ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{agent.name}</p>
                {agent.phone_number && (
                  <p className="text-muted-foreground">{agent.phone_number}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked agent</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {call.summary && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{call.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {call.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {call.transcript}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Recording */}
      {call.recording_url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full">
              <source src={call.recording_url} />
              Your browser does not support the audio element.
            </audio>
          </CardContent>
        </Card>
      )}

      {/* Metadata footer */}
      {call.disconnection_reason && (
        <>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Disconnection reason: {call.disconnection_reason}
            {call.ended_at && ` · Ended: ${formatDateTime(call.ended_at)}`}
          </p>
        </>
      )}
    </div>
  );
}
