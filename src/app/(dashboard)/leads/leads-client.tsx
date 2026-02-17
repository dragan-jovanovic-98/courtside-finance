"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Plus, Upload, X, PhoneCall, PhoneOff, Megaphone } from "lucide-react";

type Contact = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  tags: string[] | null;
  status: string;
  outcome: string | null;
  last_activity: string | null;
  last_activity_at: string | null;
  call_attempts: number;
  calls_connected: number;
  created_at: string;
};

const leadStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  new: { label: "New", variant: "outline" },
  active: { label: "Active", variant: "secondary", className: "bg-chart-2/15 text-chart-2 border-chart-2/20" },
  done: { label: "Done", variant: "default", className: "bg-emerald/15 text-emerald border-emerald/20" },
};

const outcomeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  interested: { label: "Interested", variant: "default", className: "bg-emerald/15 text-emerald border-emerald/20" },
  booked: { label: "Booked", variant: "default", className: "bg-chart-3/15 text-chart-3 border-chart-3/20" },
  unreachable: { label: "Unreachable", variant: "outline" },
  not_interested: { label: "Not Interested", variant: "outline" },
  wrong_number: { label: "Wrong Number", variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
  dnc: { label: "DNC", variant: "destructive", className: "bg-destructive/15 text-destructive border-destructive/20" },
  unqualified: { label: "Unqualified", variant: "outline" },
};

const LEAD_STATUSES = Object.keys(leadStatusConfig);
const LEAD_OUTCOMES = Object.keys(outcomeConfig);

const PAGE_SIZE = 15;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LeadsClient({ contacts, contactsInCampaigns = [] }: { contacts: Contact[]; contactsInCampaigns?: string[] }) {
  const router = useRouter();
  const campaignSet = useMemo(() => new Set(contactsInCampaigns), [contactsInCampaigns]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach((c) => c.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter((contact) => {
      if (search) {
        const q = search.toLowerCase();
        const name = `${contact.first_name} ${contact.last_name ?? ""}`.toLowerCase();
        const phone = (contact.phone ?? "").toLowerCase();
        const email = (contact.email ?? "").toLowerCase();
        const company = (contact.company ?? "").toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !email.includes(q) && !company.includes(q)) {
          return false;
        }
      }
      if (tagFilter && !contact.tags?.includes(tagFilter)) {
        return false;
      }
      if (statusFilter && contact.status !== statusFilter) {
        return false;
      }
      if (outcomeFilter && contact.outcome !== outcomeFilter) {
        return false;
      }
      return true;
    });
  }, [contacts, search, tagFilter, statusFilter, outcomeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasActiveFilters = search || tagFilter || statusFilter || outcomeFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/leads/new">
              <Plus className="size-4" />
              Add Lead
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/leads/import">
              <Upload className="size-4" />
              Import CSV
            </Link>
          </Button>
        </div>
      </div>

      {/* Search + tag filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setTagFilter(null); setStatusFilter(null); setOutcomeFilter(null); setPage(0); }}>
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground self-center mr-1">Status:</span>
        {LEAD_STATUSES.map((status) => {
          const config = leadStatusConfig[status];
          return (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setStatusFilter(statusFilter === status ? null : status);
                setPage(0);
              }}
            >
              {config.label}
            </Badge>
          );
        })}
      </div>

      {/* Outcome filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground self-center mr-1">Outcome:</span>
        {LEAD_OUTCOMES.map((outcome) => {
          const config = outcomeConfig[outcome];
          return (
            <Badge
              key={outcome}
              variant={outcomeFilter === outcome ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setOutcomeFilter(outcomeFilter === outcome ? null : outcome);
                setPage(0);
              }}
            >
              {config.label}
            </Badge>
          );
        })}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Tags:</span>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={tagFilter === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setTagFilter(tagFilter === tag ? null : tag);
                setPage(0);
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
        {hasActiveFilters ? " matching filters" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No contacts match your search."
              : "No contacts yet. Add your first lead to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((contact) => (
                  <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/leads/${contact.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/leads/${contact.id}`} className="font-medium hover:underline">
                          {contact.first_name} {contact.last_name ?? ""}
                        </Link>
                        {campaignSet.has(contact.id) && (
                          <span title="In active campaign"><Megaphone className="size-3 text-chart-2" /></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const config = leadStatusConfig[contact.status] ?? { label: contact.status, variant: "outline" as const };
                        return (
                          <Badge variant={config.variant} className={config.className ?? ""}>
                            {config.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {contact.outcome ? (() => {
                        const config = outcomeConfig[contact.outcome] ?? { label: contact.outcome, variant: "outline" as const };
                        return (
                          <Badge variant={config.variant} className={config.className ?? ""}>
                            {config.label}
                          </Badge>
                        );
                      })() : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PhoneCall className="size-3" />
                        <span>{contact.call_attempts}</span>
                        {contact.calls_connected > 0 && (
                          <>
                            <span className="text-muted-foreground/40">/</span>
                            <PhoneOff className="size-3 text-emerald" />
                            <span className="text-emerald">{contact.calls_connected}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{contact.phone ?? "—"}</TableCell>
                    <TableCell className="text-sm">{contact.email ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(contact.tags?.length ?? 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(contact.tags?.length ?? 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contact.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
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
