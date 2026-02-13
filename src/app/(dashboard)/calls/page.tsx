import { createClient } from "@/lib/supabase/server";
import { CallsClient } from "./calls-client";

export default async function CallsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: calls } = await supabase
    .from("calls")
    .select(
      "id, direction, status, from_number, to_number, duration_seconds, summary, recording_url, started_at, contacts(first_name, last_name, phone), voice_agents(name)"
    )
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false, nullsFirst: false });

  const { data: agents } = await supabase
    .from("voice_agents")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  return (
    <CallsClient
      calls={calls ?? []}
      agents={agents ?? []}
    />
  );
}
