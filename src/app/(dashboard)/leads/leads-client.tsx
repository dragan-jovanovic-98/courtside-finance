"use client";

import { useMemo, useState } from "react";
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
import { Users, Search, Plus, Upload, X } from "lucide-react";

type Contact = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  tags: string[] | null;
  created_at: string;
};

const PAGE_SIZE = 15;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LeadsClient({ contacts }: { contacts: Contact[] }) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
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
      return true;
    });
  }, [contacts, search, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasActiveFilters = search || tagFilter;

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
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setTagFilter(null); setPage(0); }}>
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((contact) => (
                  <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/leads/${contact.id}`} className="font-medium hover:underline">
                        {contact.first_name} {contact.last_name ?? ""}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{contact.phone ?? "—"}</TableCell>
                    <TableCell className="text-sm">{contact.email ?? "—"}</TableCell>
                    <TableCell className="text-sm">{contact.company ?? "—"}</TableCell>
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
