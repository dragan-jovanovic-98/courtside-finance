"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Pause, CheckCircle } from "lucide-react";
import { updateCampaignStatus } from "../actions";

export function CampaignActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(
    newStatus: "in_progress" | "paused" | "completed"
  ) {
    setLoading(true);
    await updateCampaignStatus(id, newStatus);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {(status === "draft" || status === "scheduled") && (
        <Button
          size="sm"
          onClick={() => handleAction("in_progress")}
          disabled={loading}
        >
          <Play className="size-4" />
          {loading ? "Starting..." : "Start Campaign"}
        </Button>
      )}
      {status === "in_progress" && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction("paused")}
            disabled={loading}
          >
            <Pause className="size-4" />
            Pause
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("completed")}
            disabled={loading}
          >
            <CheckCircle className="size-4" />
            Complete
          </Button>
        </>
      )}
      {status === "paused" && (
        <Button
          size="sm"
          onClick={() => handleAction("in_progress")}
          disabled={loading}
        >
          <Play className="size-4" />
          {loading ? "Resuming..." : "Resume"}
        </Button>
      )}
    </div>
  );
}
