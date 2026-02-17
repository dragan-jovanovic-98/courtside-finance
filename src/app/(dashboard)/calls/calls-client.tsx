"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, Search, X } from "lucide-react";

type Call = {
  id: string;
  direction: "inbound" | "outbound";
  status: string;
  from_number: string | null;
  to_number: string | null;
  duration_seconds: number | null;
  summary: string | null;
  recording_url: string | null;
  started_at: string | null;
  outcome: string[] | null;
  contacts: { first_name: string | null; last_name: string | null; phone: string | null } | null;
  voice_agents: { name: string } | null;
};

type Agent = { id: string; name: string };

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  pending: "outline",
  failed: "destructive",
  voicemail: "secondary",
  no_answer: "outline",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 15;

export function CallsClient({
  calls,
  agents,
}: {
  calls: Call[];
  agents: Agent[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return calls.filter((call) => {
      if (search) {
        const q = search.toLowerCase();
        const contactName = call.contacts
          ? `${call.contacts.first_name ?? ""} ${call.contacts.last_name ?? ""}`.toLowerCase()
          : "";
        const phone = (call.from_number ?? "") + (call.to_number ?? "");
        if (!contactName.includes(q) && !phone.includes(q)) return false;
      }
      if (statusFilter !== "all" && call.status !== statusFilter) return false;
      if (directionFilter !== "all" && call.direction !== directionFilter) return false;
      if (agentFilter !== "all") {
        const agentName = (call.voice_agents as unknown as { name: string } | null)?.name;
        if (agentName !== agentFilter) return false;
      }
      return true;
    });
  }, [calls, search, statusFilter, directionFilter, agentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const hasActiveFilters =
    search || statusFilter !== "all" || directionFilter !== "all" || agentFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDirectionFilter("all");
    setAgentFilter("all");
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Call Logs</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="voicemail">Voicemail</SelectItem>
            <SelectItem value="no_answer">No answer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={directionFilter} onValueChange={(v) => { setDirectionFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All directions</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={(v) => { setAgentFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.name}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} call{filtered.length !== 1 ? "s" : ""}
        {hasActiveFilters ? " matching filters" : ""}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Phone className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No calls match your filters."
              : "No calls yet. Call activity will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Date Called</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((call) => {
                  const contact = call.contacts as unknown as {
                    first_name: string | null;
                    last_name: string | null;
                    phone: string | null;
                  } | null;
                  const contactName = contact
                    ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim()
                    : null;
                  const displayName =
                    contactName ||
                    (call.direction === "outbound" ? call.to_number : call.from_number) ||
                    "Unknown";

                  return (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/calls/${call.id}`)}>
                      <TableCell>
                        <Link
                          href={`/calls/${call.id}`}
                          className="font-medium hover:underline"
                        >
                          {displayName}
                        </Link>
                        {contact?.phone && (
                          <p className="text-xs text-muted-foreground">
                            {contact.phone}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {call.duration_seconds != null && call.duration_seconds > 0
                          ? formatDuration(call.duration_seconds)
                          : "---"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[call.status] ?? "outline"}>
                          {call.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {call.outcome && call.outcome.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {call.outcome.map((o) => (
                              <Badge key={o} variant="outline" className="text-xs">
                                {o.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">---</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {call.started_at ? formatDate(call.started_at) : "---"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
