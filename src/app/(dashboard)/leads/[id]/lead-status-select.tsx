"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatus, updateLeadOutcome } from "../actions";

const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

const LEAD_OUTCOMES = [
  { value: "none", label: "No Outcome" },
  { value: "interested", label: "Interested" },
  { value: "booked", label: "Booked" },
  { value: "unreachable", label: "Unreachable" },
  { value: "not_interested", label: "Not Interested" },
  { value: "wrong_number", label: "Wrong Number" },
  { value: "dnc", label: "DNC" },
  { value: "unqualified", label: "Unqualified" },
];

export function LeadStatusSelect({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(value: string) {
    setLoading(true);
    const result = await updateLeadStatus(id, value);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Lead status updated.");
    }
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function LeadOutcomeSelect({ id, currentOutcome }: { id: string; currentOutcome: string | null }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(value: string) {
    setLoading(true);
    const result = await updateLeadOutcome(id, value === "none" ? null : value);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Lead outcome updated.");
    }
  }

  return (
    <Select defaultValue={currentOutcome ?? "none"} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-[150px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_OUTCOMES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
