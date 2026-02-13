"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createContact, updateContact } from "./actions";

type ContactData = {
  id?: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  tags: string[] | null;
};

export function ContactForm({
  contact,
  mode,
}: {
  contact?: ContactData;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result =
      mode === "edit" && contact?.id
        ? await updateContact(contact.id, formData)
        : await createContact(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === "create" && "id" in result && result.id) {
      router.push(`/leads/${result.id}`);
    } else {
      router.push(contact?.id ? `/leads/${contact.id}` : "/leads");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add New Lead" : "Edit Lead"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name *</Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={contact?.first_name ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={contact?.last_name ?? ""}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact?.phone ?? ""}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              defaultValue={contact?.company ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">
              Tags <span className="text-muted-foreground">(comma-separated)</span>
            </Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={contact?.tags?.join(", ") ?? ""}
              placeholder="hot-lead, refinance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={contact?.notes ?? ""}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Add Lead" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
