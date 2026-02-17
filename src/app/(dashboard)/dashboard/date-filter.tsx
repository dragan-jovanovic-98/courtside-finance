"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const RANGES = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "All", value: "all" },
] as const;

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "all";

  function setRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("range");
    } else {
      params.set("range", value);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 rounded-lg border border-border/50 bg-muted/30 p-0.5">
      {RANGES.map((r) => (
        <Button
          key={r.value}
          variant={current === r.value ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-3 text-xs font-medium"
          onClick={() => setRange(r.value)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
