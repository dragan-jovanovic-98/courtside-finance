import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "./campaign-form";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agents } = await supabase
    .from("voice_agents")
    .select("id, name")
    .eq("user_id", user!.id)
    .eq("status", "active")
    .order("name");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone")
    .eq("user_id", user!.id)
    .order("first_name");

  return (
    <div className="max-w-2xl">
      <CampaignForm agents={agents ?? []} contacts={contacts ?? []} />
    </div>
  );
}
