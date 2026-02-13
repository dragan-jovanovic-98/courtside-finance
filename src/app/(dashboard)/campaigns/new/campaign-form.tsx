"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { createCampaign } from "../actions";

type Agent = { id: string; name: string };
type Contact = { id: string; first_name: string; last_name: string | null; phone: string | null };

export function CampaignForm({
  agents,
  contacts,
}: {
  agents: Agent[];
  contacts: Contact[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [agentId, setAgentId] = useState<string>("");

  function toggleContact(id: string) {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    // Add selected contacts to form data
    selectedContacts.forEach((id) => formData.append("contact_ids", id));
    if (agentId) formData.set("agent_id", agentId);

    const result = await createCampaign(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/campaigns/${result.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/campaigns">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New Campaign</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Voice Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">
                Schedule <span className="text-muted-foreground">(optional — leave blank for draft)</span>
              </Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" />
            </div>

            {/* Execution controls */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select name="timezone" defaultValue="America/New_York">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="America/Phoenix">Arizona (no DST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="call_window_start">
                  Call Window Start <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="call_window_start" name="call_window_start" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="call_window_end">
                  Call Window End <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="call_window_end" name="call_window_end" type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_cap">
                  Daily Cap <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="daily_cap" name="daily_cap" type="number" min={1} placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_concurrent_calls">Max Concurrent Calls</Label>
                <Input id="max_concurrent_calls" name="max_concurrent_calls" type="number" min={1} defaultValue={5} />
              </div>
            </div>

            {/* Contact selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Contacts ({selectedContacts.size} selected)</Label>
                <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                  {selectedContacts.size === contacts.length ? "Deselect all" : "Select all"}
                </Button>
              </div>
              <div className="rounded border max-h-60 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No contacts yet. <Link href="/leads/new" className="underline">Add contacts</Link> first.
                  </p>
                ) : (
                  contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => toggleContact(contact.id)}
                        className="rounded border-muted-foreground"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                          {contact.first_name} {contact.last_name ?? ""}
                        </span>
                        {contact.phone && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Campaign"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
